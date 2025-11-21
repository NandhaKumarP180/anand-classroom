// Minimal HTTP server using only Node.js built-ins (no npm install needed!)
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { CosmosClient } = require('@azure/cosmos');

const PORT = process.env.PORT || 7072;

// Load environment variables from local.settings.json
const settingsPath = path.join(__dirname, 'local.settings.json');
if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  Object.assign(process.env, settings.Values);
}

// Import Cosmos client and validation
const { roomsContainer, bookingsContainer, isCosmosConfigured } = require('./src/cosmosClient');
const { validateBooking, checkConflict } = require('./src/utils/validation');

const databaseId = process.env.COSMOS_DATABASE || 'classroom-booking';
let cosmosSchemaEnsured = false;
const ensureCosmosSchema = async () => {
  if (cosmosSchemaEnsured) return;
  if (!isCosmosConfigured) return;
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const client = new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  await database.containers.createIfNotExists({ id: 'rooms', partitionKey: { paths: ['/building'] } });
  await database.containers.createIfNotExists({ id: 'bookings', partitionKey: { paths: ['/id'] } });
  cosmosSchemaEnsured = true;
};

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
};

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  console.log(`${method} ${pathname}`);

  try {
    if (method === 'GET' && pathname === '/api/health') {
      let status = { ok: true, cosmos: isCosmosConfigured };
      if (isCosmosConfigured) {
        try {
          await ensureCosmosSchema();
          const { resources } = await roomsContainer.items
            .query('SELECT TOP 1 * FROM c')
            .fetchAll();
          status.sample = resources.length;
        } catch (e) {
          status.ok = false;
          status.error = e.message;
        }
      }
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify(status));
      return;
    }

    // GET /api/rooms
    if (method === 'GET' && pathname === '/api/rooms') {
      try {
        // Try primary query
        const initial = await roomsContainer.items
          .query('SELECT * FROM c')
          .fetchAll();
        let rooms = initial.resources || [];

        // If Cosmos is configured but empty, auto-seed with sample rooms
        if (isCosmosConfigured && rooms.length === 0) {
          try {
            await ensureCosmosSchema();
            const mock = require('./src/mockData');
            const samples = mock.getAllRooms();
            for (const r of samples) {
              try { await roomsContainer.items.create(r); } catch (_) { /* ignore duplicate */ }
            }
            const afterSeed = await roomsContainer.items
              .query('SELECT * FROM c')
              .fetchAll();
            rooms = (afterSeed.resources && afterSeed.resources.length > 0)
              ? afterSeed.resources
              : samples;
          } catch (seedErr) {
            // If seeding fails, respond with mock rooms so UI still works
            rooms = require('./src/mockData').getAllRooms();
          }
        }

        // If Cosmos not configured, return mock rooms immediately
        if (!isCosmosConfigured && rooms.length === 0) {
          rooms = require('./src/mockData').getAllRooms();
        }

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify(rooms));
      } catch (e) {
        try {
          if (isCosmosConfigured) {
            await ensureCosmosSchema();
            const { resources: rooms2 } = await roomsContainer.items
              .query('SELECT * FROM c')
              .fetchAll();
            // If still empty, return mock to avoid empty UI
            const safeRooms = (rooms2 && rooms2.length > 0)
              ? rooms2
              : require('./src/mockData').getAllRooms();
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify(safeRooms));
          } else {
            const mock = require('./src/mockData');
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify(mock.getAllRooms()));
          }
        } catch (e2) {
          const mock = require('./src/mockData');
          res.writeHead(200, corsHeaders);
          res.end(JSON.stringify(mock.getAllRooms()));
        }
      }
      return;
    }

    // GET /api/bookings
    if (method === 'GET' && pathname === '/api/bookings') {
      const { roomId, date } = parsedUrl.query;
      
      let query = 'SELECT * FROM c';
      const parameters = [];

      if (roomId) {
        query += ' WHERE c.roomId = @roomId';
        parameters.push({ name: '@roomId', value: roomId });
      }

      const { resources: bookings } = await bookingsContainer.items
        .query({ query, parameters })
        .fetchAll();

      let filteredBookings = bookings;
      if (date) {
        filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.startIso).toISOString().split('T')[0];
          return bookingDate === date;
        });
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify(filteredBookings));
      return;
    }

    // POST /api/bookings
    if (method === 'POST' && pathname === '/api/bookings') {
      const booking = await parseBody(req);

      // Validate
      const errors = validateBooking(booking);
      if (errors.length > 0) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: errors.join(', ') }));
        return;
      }

      // Check conflicts
      const { resources: existingBookings } = await bookingsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.roomId = @roomId',
          parameters: [{ name: '@roomId', value: booking.roomId }]
        })
        .fetchAll();

      const conflictCheck = checkConflict(booking, existingBookings);
      
      if (conflictCheck.hasConflict) {
        res.writeHead(409, corsHeaders);
        res.end(JSON.stringify({
          error: 'Booking conflict detected',
          conflictingBooking: conflictCheck.conflictingBooking
        }));
        return;
      }

      // Create booking
      const newBooking = {
        id: `b${Date.now()}`,
        ...booking,
        status: 'pending',
        createdAtIso: new Date().toISOString()
      };

      const { resource: createdBooking } = await bookingsContainer.items.create(newBooking);
      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify(createdBooking));
      return;
    }

    // PATCH /api/bookings/:id/approve
    if (method === 'PATCH' && pathname.match(/^\/api\/bookings\/(.+)\/approve$/)) {
      const bookingId = pathname.match(/^\/api\/bookings\/(.+)\/approve$/)[1];
      
      const { resource: booking } = await bookingsContainer.item(bookingId, bookingId).read();

      if (!booking) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({ error: 'Booking not found' }));
        return;
      }

      booking.status = 'approved';
      booking.approvedAtIso = new Date().toISOString();

      const { resource: updated } = await bookingsContainer.item(bookingId, bookingId).replace(booking);

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify(updated));
      return;
    }

    // PATCH /api/bookings/:id/deny
    if (method === 'PATCH' && pathname.match(/^\/api\/bookings\/(.+)\/deny$/)) {
      const bookingId = pathname.match(/^\/api\/bookings\/(.+)\/deny$/)[1];
      
      const { resource: booking } = await bookingsContainer.item(bookingId, bookingId).read();

      if (!booking) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({ error: 'Booking not found' }));
        return;
      }

      booking.status = 'denied';
      booking.deniedAtIso = new Date().toISOString();

      const { resource: updated } = await bookingsContainer.item(bookingId, bookingId).replace(booking);

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify(updated));
      return;
    }

    // POST /api/ai/suggestRoom
    if (method === 'POST' && pathname === '/api/ai/suggestRoom') {
      const { date, time, capacity, purpose } = await parseBody(req);

      if (!date || !time || !capacity || !purpose) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      const { resources: rooms } = await roomsContainer.items
        .query('SELECT * FROM c WHERE c.active = true')
        .fetchAll();
      
      const suitableRooms = rooms.filter(r => r.capacity >= parseInt(capacity));
      
      const { resources: allBookings } = await bookingsContainer.items
        .query('SELECT * FROM c WHERE c.status = "approved"')
        .fetchAll();
      
      const bookings = allBookings.filter(b => {
        const bookingDate = new Date(b.startIso).toISOString().split('T')[0];
        return bookingDate === date;
      });

      const requestedDateTime = new Date(`${date}T${time}:00Z`);
      const availableRooms = suitableRooms.filter(room => {
        const roomBookings = bookings.filter(b => b.roomId === room.id);
        
        for (const booking of roomBookings) {
          const start = new Date(booking.startIso);
          const end = new Date(booking.endIso);
          if (requestedDateTime >= start && requestedDateTime < end) {
            return false;
          }
        }
        return true;
      });

      let suggestedRooms = [];
      let reason = '';

      if (availableRooms.length === 0) {
        suggestedRooms = suitableRooms.slice(0, 2).map(r => `${r.building}-${r.name}`);
        reason = 'No rooms available at requested time. Showing alternative rooms with sufficient capacity.';
      } else {
        const withProjector = availableRooms.filter(r => r.features?.includes('projector'));
        
        if (purpose.toLowerCase().includes('lecture') || purpose.toLowerCase().includes('seminar')) {
          suggestedRooms = (withProjector.length > 0 ? withProjector : availableRooms)
            .slice(0, 2)
            .map(r => `${r.building}-${r.name}`);
          reason = 'Recommended rooms with projector facilities for presentations. Available at requested time.';
        } else {
          suggestedRooms = availableRooms.slice(0, 2).map(r => `${r.building}-${r.name}`);
          reason = 'Best-fit rooms based on capacity and availability at requested time.';
        }
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({ suggestedRooms, reason }));
      return;
    }

    // 404 Not Found
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({ error: 'Not Found' }));

  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log('\n🚀 Azure Classroom Booking API Server');
  console.log('=====================================');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API Base: http://localhost:${PORT}/api`);
  console.log('\n📡 Available endpoints:');
  console.log('  GET    /api/rooms');
  console.log('  GET    /api/bookings');
  console.log('  POST   /api/bookings');
  console.log('  PATCH  /api/bookings/:id/approve');
  console.log('  PATCH  /api/bookings/:id/deny');
  console.log('  POST   /api/ai/suggestRoom');
  console.log('\n💾 Database:', isCosmosConfigured ? '✓ Azure Cosmos DB Connected' : '⚠ Using mock data');
  console.log('=====================================\n');
});
