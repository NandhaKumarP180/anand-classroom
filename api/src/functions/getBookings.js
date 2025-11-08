const { app } = require('@azure/functions');
const { bookingsContainer } = require('../cosmosClient');

app.http('getBookings', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bookings',
  handler: async (request, context) => {
    context.log('GET /api/bookings - Fetching bookings');

    try {
      const roomId = request.query.get('roomId');
      const date = request.query.get('date');

      let query = 'SELECT * FROM c';
      const parameters = [];

      if (roomId) {
        query += ' WHERE c.roomId = @roomId';
        parameters.push({ name: '@roomId', value: roomId });
      }

      const { resources: bookings } = await bookingsContainer.items
        .query({ query, parameters })
        .fetchAll();

      // Filter by date if provided
      let filteredBookings = bookings;
      if (date) {
        filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.startIso).toISOString().split('T')[0];
          return bookingDate === date;
        });
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredBookings)
      };
    } catch (error) {
      context.log.error('Error fetching bookings:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch bookings' })
      };
    }
  }
});
