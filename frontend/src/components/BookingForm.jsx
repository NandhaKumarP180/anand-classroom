import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

function BookingForm({ userEmail }) {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    requesterName: '',
    requesterEmail: userEmail || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, requesterEmail: userEmail || '' }));
  }, [userEmail]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE}/rooms`);
      const data = await response.json();
      setRooms(data.filter(r => r.active));
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.requesterEmail) {
      setMessage({ type: 'error', text: 'Please set your email in the header first' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const startIso = new Date(`${formData.date}T${formData.startTime}:00Z`).toISOString();
      const endIso = new Date(`${formData.date}T${formData.endTime}:00Z`).toISOString();

      const booking = {
        roomId: formData.roomId,
        requesterEmail: formData.requesterEmail,
        requesterName: formData.requesterName,
        purpose: formData.purpose,
        startIso,
        endIso
      };

      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      setMessage({ type: 'success', text: 'Booking created successfully! Status: Pending approval' });
      setFormData({
        roomId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        requesterName: '',
        requesterEmail: userEmail || ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h2>Book a Classroom</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Room *</label>
          <select
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            required
          >
            <option value="">Select a room</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} - Building {room.building} (Capacity: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time *</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Your Name *</label>
          <input
            type="text"
            value={formData.requesterName}
            onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label>Purpose *</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="Guest Lecture, Seminar, Workshop, etc."
            rows="3"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Booking...' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
