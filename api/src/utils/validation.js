function validateBooking(booking) {
  const errors = [];

  if (!booking.roomId) errors.push('roomId is required');
  if (!booking.requesterEmail) errors.push('requesterEmail is required');
  if (!booking.requesterName) errors.push('requesterName is required');
  if (!booking.purpose) errors.push('purpose is required');
  if (!booking.startIso) errors.push('startIso is required');
  if (!booking.endIso) errors.push('endIso is required');

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (booking.requesterEmail && !emailRegex.test(booking.requesterEmail)) {
    errors.push('Invalid email format');
  }

  // Validate time range
  if (booking.startIso && booking.endIso) {
    const start = new Date(booking.startIso);
    const end = new Date(booking.endIso);
    
    if (isNaN(start.getTime())) errors.push('Invalid startIso format');
    if (isNaN(end.getTime())) errors.push('Invalid endIso format');
    
    if (start >= end) {
      errors.push('startIso must be before endIso');
    }
  }

  return errors;
}

function checkConflict(newBooking, existingBookings) {
  const newStart = new Date(newBooking.startIso);
  const newEnd = new Date(newBooking.endIso);

  for (const existing of existingBookings) {
    // Only check approved bookings for conflicts
    if (existing.status !== 'approved') continue;
    
    // Skip if different room
    if (existing.roomId !== newBooking.roomId) continue;

    const existingStart = new Date(existing.startIso);
    const existingEnd = new Date(existing.endIso);

    // Conflict logic: (newStart < existingEnd) && (newEnd > existingStart)
    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        hasConflict: true,
        conflictingBooking: existing
      };
    }
  }

  return { hasConflict: false };
}

module.exports = {
  validateBooking,
  checkConflict
};
