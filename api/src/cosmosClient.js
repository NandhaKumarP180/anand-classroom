const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'classroom-booking';

// Check if Cosmos DB is configured
const isCosmosConfigured = endpoint && key && 
  endpoint !== 'https://your-cosmos-account.documents.azure.com:443/' &&
  key !== 'your-cosmos-key-here';

let roomsContainer, bookingsContainer;

if (isCosmosConfigured) {
  // Use real Cosmos DB
  const client = new CosmosClient({ endpoint, key });
  const database = client.database(databaseId);
  roomsContainer = database.container('rooms');
  bookingsContainer = database.container('bookings');
  console.log('✓ Using Azure Cosmos DB');
} else {
  // Use mock data for local testing
  console.log('⚠ Cosmos DB not configured, using mock data for local testing');
  const mockData = require('./mockData');
  
  // Create mock container interface
  const createMockContainer = (getData, getById, create, update) => ({
    items: {
      query: () => ({
        fetchAll: async () => ({ resources: getData() })
      }),
      create: async (item) => ({ resource: create(item) })
    },
    item: (id) => ({
      read: async () => ({ resource: getById(id) }),
      replace: async (item) => ({ resource: update(id, item) })
    })
  });

  roomsContainer = createMockContainer(
    () => mockData.getAllRooms(),
    (id) => mockData.getAllRooms().find(r => r.id === id),
    (item) => item,
    (id, item) => item
  );

  bookingsContainer = createMockContainer(
    () => mockData.getAllBookings(),
    (id) => mockData.getBookingById(id),
    (item) => mockData.createBooking(item),
    (id, item) => mockData.updateBooking(id, item)
  );
}

module.exports = {
  roomsContainer,
  bookingsContainer,
  isCosmosConfigured
};
