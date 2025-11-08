import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

function AdminPanel({ isAdmin, setIsAdmin }) {
  const [passphrase, setPassphrase] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isAdmin) {
      fetchAllBookings();
    }
  }, [isAdmin]);

  const handleLogin = () => {
    if (passphrase === 'admin123') {
      setIsAdmin(true);
      setMessage({ type: 'success', text: 'Admin access granted' });
    } else {
      setMessage({ type: 'error', text: 'Invalid passphrase' });
    }
  };

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve booking');
      }

      setMessage({ type: 'success', text: 'Booking approved successfully' });
      fetchAllBookings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeny = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}/deny`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deny booking');
      }

      setMessage({ type: 'success', text: 'Booking denied' });
      fetchAllBookings();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <h2>Admin Panel</h2>
        <div className="admin-login">
          <p>Enter admin passphrase to access:</p>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter passphrase"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="btn-primary">Login</button>
          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel - Manage Bookings</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : (
        <div className="admin-bookings">
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Requester</th>
                  <th>Purpose</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.roomId}</td>
                    <td>
                      {booking.requesterName}<br />
                      <small>{booking.requesterEmail}</small>
                    </td>
                    <td>{booking.purpose}</td>
                    <td>{formatDateTime(booking.startIso)}</td>
                    <td>{formatDateTime(booking.endIso)}</td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="btn-approve"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleDeny(booking.id)}
                            className="btn-deny"
                          >
                            ✗ Deny
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
