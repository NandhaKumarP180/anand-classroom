const { app } = require('@azure/functions');
const { bookingsContainer } = require('../cosmosClient');

app.http('denyBooking', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'bookings/{id}/deny',
  handler: async (request, context) => {
    const bookingId = request.params.id;
    context.log(`PATCH /api/bookings/${bookingId}/deny - Denying booking`);

    try {
      // Fetch the booking
      const { resource: booking } = await bookingsContainer.item(bookingId, bookingId).read();

      if (!booking) {
        return {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Booking not found' })
        };
      }

      // Update status to denied
      booking.status = 'denied';
      booking.deniedAtIso = new Date().toISOString();

      const { resource: updatedBooking } = await bookingsContainer
        .item(bookingId, bookingId)
        .replace(booking);

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking)
      };
    } catch (error) {
      context.log.error('Error denying booking:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to deny booking' })
      };
    }
  }
});
