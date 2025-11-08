const { app } = require('@azure/functions');
const { roomsContainer } = require('../cosmosClient');

app.http('getRooms', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'rooms',
  handler: async (request, context) => {
    context.log('GET /api/rooms - Fetching all rooms');

    try {
      const { resources: rooms } = await roomsContainer.items
        .query('SELECT * FROM c')
        .fetchAll();

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rooms)
      };
    } catch (error) {
      context.log.error('Error fetching rooms:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch rooms' })
      };
    }
  }
});
