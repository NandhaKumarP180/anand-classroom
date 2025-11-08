// Quick script to seed Cosmos DB with sample data
const fs = require('fs');
const path = require('path');

// Load environment variables
const settingsPath = path.join(__dirname, 'local.settings.json');
if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  Object.assign(process.env, settings.Values);
}

const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'classroom-booking';

const client = new CosmosClient({ endpoint, key });

const seedData = {
  rooms: [
    {
      id: "r101",
      name: "Room 101",
      building: "A",
      capacity: 30,
      features: ["projector", "whiteboard"],
      active: true
    },
    {
      id: "r102",
      name: "Room 102",
      building: "A",
      capacity: 50,
      features: ["projector", "audio-system"],
      active: true
    },
    {
      id: "r201",
      name: "Room 201",
      building: "B",
      capacity: 40,
      features: ["projector", "whiteboard", "smart-board"],
      active: true
    },
    {
      id: "r202",
      name: "Room 202",
      building: "B",
      capacity: 25,
      features: ["whiteboard"],
      active: true
    },
    {
      id: "r301",
      name: "Lab 301",
      building: "C",
      capacity: 35,
      features: ["computers", "projector"],
      active: true
    }
  ],
  bookings: [
    {
      id: "b001",
      roomId: "r101",
      requesterEmail: "john.doe@college.edu",
      requesterName: "John Doe",
      purpose: "Guest Lecture on Cloud Computing",
      startIso: "2025-11-05T10:00:00Z",
      endIso: "2025-11-05T12:00:00Z",
      status: "approved",
      createdAtIso: "2025-11-03T08:00:00Z",
      approvedAtIso: "2025-11-03T09:00:00Z"
    },
    {
      id: "b002",
      roomId: "r201",
      requesterEmail: "jane.smith@college.edu",
      requesterName: "Jane Smith",
      purpose: "Workshop on AI/ML",
      startIso: "2025-11-06T14:00:00Z",
      endIso: "2025-11-06T17:00:00Z",
      status: "pending",
      createdAtIso: "2025-11-03T10:00:00Z"
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('\n🌱 Seeding Azure Cosmos DB...\n');
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Database: ${databaseId}\n`);

    const database = client.database(databaseId);

    // Seed rooms
    console.log('📦 Seeding rooms container...');
    const roomsContainer = database.container('rooms');
    
    for (const room of seedData.rooms) {
      try {
        await roomsContainer.items.create(room);
        console.log(`  ✓ Created room: ${room.name}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  - Room ${room.name} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    // Seed bookings
    console.log('\n📦 Seeding bookings container...');
    const bookingsContainer = database.container('bookings');
    
    for (const booking of seedData.bookings) {
      try {
        await bookingsContainer.items.create(booking);
        console.log(`  ✓ Created booking: ${booking.id} (${booking.purpose})`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  - Booking ${booking.id} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${seedData.rooms.length} rooms`);
    console.log(`  - ${seedData.bookings.length} bookings\n`);

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
