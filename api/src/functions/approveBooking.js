const { app } = require('@azure/functions');
const { bookingsContainer } = require('../cosmosClient');

app.http('approveBooking', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'bookings/{id}/approve',
  handler: async (request, context) => {
    const bookingId = request.params.id;
    context.log(`PATCH /api/bookings/${bookingId}/approve - Approving booking`);

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

      // Update status to approved
      booking.status = 'approved';
      booking.approvedAtIso = new Date().toISOString();

      const { resource: updatedBooking } = await bookingsContainer
        .item(bookingId, bookingId)
        .replace(booking);

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking)
      };
    } catch (error) {
      context.log.error('Error approving booking:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to approve booking' })
      };
    }
  }
});
