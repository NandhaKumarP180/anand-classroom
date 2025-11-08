import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

function MyBookings({ userEmail }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userEmail) {
      fetchMyBookings();
    }
  }, [userEmail]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      
      // Filter bookings by user email
      const myBookings = data.filter(b => b.requesterEmail === userEmail);
      setBookings(myBookings);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'denied': return 'status-denied';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  if (!userEmail) {
    return (
      <div className="my-bookings">
        <h2>My Bookings</h2>
        <p className="info-message">Please set your email in the header to view your bookings.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading your bookings...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      
      {bookings.length === 0 ? (
        <p className="info-message">You have no bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>Room: {booking.roomId}</h3>
                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Purpose:</strong> {booking.purpose}</p>
                <p><strong>Start:</strong> {formatDateTime(booking.startIso)}</p>
                <p><strong>End:</strong> {formatDateTime(booking.endIso)}</p>
                <p><strong>Requested:</strong> {formatDateTime(booking.createdAtIso)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
