const { app } = require('@azure/functions');
const { roomsContainer, bookingsContainer } = require('../cosmosClient');

app.http('suggestRoom', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ai/suggestRoom',
  handler: async (request, context) => {
    context.log('POST /api/ai/suggestRoom - Getting AI room suggestions');

    try {
      const { date, time, capacity, purpose } = await request.json();

      if (!date || !time || !capacity || !purpose) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Missing required fields: date, time, capacity, purpose' })
        };
      }

      // Fetch all active rooms
      const { resources: rooms } = await roomsContainer.items
        .query('SELECT * FROM c WHERE c.active = true')
        .fetchAll();

      // Filter rooms by capacity
      const suitableRooms = rooms.filter(room => room.capacity >= parseInt(capacity));

      // Fetch bookings for the date
      const { resources: allBookings } = await bookingsContainer.items
        .query('SELECT * FROM c WHERE c.status = "approved"')
        .fetchAll();

      const dateBookings = allBookings.filter(b => {
        const bookingDate = new Date(b.startIso).toISOString().split('T')[0];
        return bookingDate === date;
      });

      // Find available rooms (not booked at the requested time)
      const requestedDateTime = new Date(`${date}T${time}:00Z`);
      const availableRooms = suitableRooms.filter(room => {
        const roomBookings = dateBookings.filter(b => b.roomId === room.id);
        
        // Check if room is free at requested time
        for (const booking of roomBookings) {
          const bookingStart = new Date(booking.startIso);
          const bookingEnd = new Date(booking.endIso);
          
          if (requestedDateTime >= bookingStart && requestedDateTime < bookingEnd) {
            return false; // Room is occupied
          }
        }
        return true; // Room is available
      });

      // Use mock AI logic (can be replaced with Azure OpenAI)
      let suggestedRooms = [];
      let reason = '';

      if (availableRooms.length === 0) {
        suggestedRooms = suitableRooms.slice(0, 2).map(r => `${r.building}-${r.name}`);
        reason = 'No rooms available at requested time. Showing alternative rooms with sufficient capacity.';
      } else {
        // Prioritize rooms with features
        const roomsWithProjector = availableRooms.filter(r => r.features?.includes('projector'));
        
        if (purpose.toLowerCase().includes('lecture') || purpose.toLowerCase().includes('seminar')) {
          suggestedRooms = (roomsWithProjector.length > 0 ? roomsWithProjector : availableRooms)
            .slice(0, 2)
            .map(r => `${r.building}-${r.name}`);
          reason = 'Recommended rooms with projector facilities for presentations. Available at requested time.';
        } else {
          suggestedRooms = availableRooms.slice(0, 2).map(r => `${r.building}-${r.name}`);
          reason = 'Best-fit rooms based on capacity and availability at requested time.';
        }
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestedRooms,
          reason
        })
      };
    } catch (error) {
      context.log.error('Error getting AI suggestions:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to get room suggestions' })
      };
    }
  }
});
