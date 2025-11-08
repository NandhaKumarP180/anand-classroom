import React, { useState } from 'react';
import { API_BASE } from '../config';

function AISuggestion() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    capacity: '',
    purpose: ''
  });
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const response = await fetch(`${API_BASE}/ai/suggestRoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-suggestion">
      <h2>🤖 AI Room Suggestions</h2>
      <p className="subtitle">Get intelligent room recommendations based on your requirements</p>

      <form onSubmit={handleSubmit} className="ai-form">
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

        <div className="form-group">
          <label>Preferred Time *</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Expected Capacity *</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            placeholder="e.g., 30"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Purpose *</label>
          <input
            type="text"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="e.g., Seminar, Workshop, Lecture"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Getting Suggestions...' : 'Get AI Suggestions'}
        </button>
      </form>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {suggestions && (
        <div className="suggestions-result">
          <h3>Recommended Rooms</h3>
          <div className="suggested-rooms">
            {suggestions.suggestedRooms.map((room, index) => (
              <div key={index} className="suggested-room">
                <span className="room-badge">{room}</span>
              </div>
            ))}
          </div>
          <div className="ai-reason">
            <strong>Reasoning:</strong>
            <p>{suggestions.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISuggestion;
