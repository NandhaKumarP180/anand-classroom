const { app } = require('@azure/functions');
const { bookingsContainer } = require('../cosmosClient');
const { validateBooking, checkConflict } = require('../utils/validation');

app.http('createBooking', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'bookings',
  handler: async (request, context) => {
    context.log('POST /api/bookings - Creating new booking');

    try {
      const booking = await request.json();

      // Validate booking data
      const validationErrors = validateBooking(booking);
      if (validationErrors.length > 0) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: validationErrors.join(', ') })
        };
      }

      // Fetch existing bookings for the room
      const { resources: existingBookings } = await bookingsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.roomId = @roomId',
          parameters: [{ name: '@roomId', value: booking.roomId }]
        })
        .fetchAll();

      // Check for conflicts
      const conflictCheck = checkConflict(booking, existingBookings);
      if (conflictCheck.hasConflict) {
        return {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Booking conflict detected',
            conflictingBooking: conflictCheck.conflictingBooking
          })
        };
      }

      // Create new booking
      const newBooking = {
        id: `b${Date.now()}`,
        ...booking,
        status: 'pending',
        createdAtIso: new Date().toISOString()
      };

      const { resource: createdBooking } = await bookingsContainer.items.create(newBooking);

      return {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdBooking)
      };
    } catch (error) {
      context.log.error('Error creating booking:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to create booking' })
      };
    }
  }
});
