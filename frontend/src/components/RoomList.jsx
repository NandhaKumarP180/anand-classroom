import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading rooms...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="room-list">
      <h2>Available Classrooms</h2>
      <div className="rooms-grid">
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            <div className="room-details">
              <p><strong>Building:</strong> {room.building}</p>
              <p><strong>Capacity:</strong> {room.capacity} seats</p>
              <p><strong>Features:</strong> {room.features?.join(', ') || 'None'}</p>
              <p className={`status ${room.active ? 'active' : 'inactive'}`}>
                {room.active ? '✓ Active' : '✗ Inactive'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomList;
