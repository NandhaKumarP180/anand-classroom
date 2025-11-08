import React, { useState } from 'react';
import RoomList from './components/RoomList';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';
import AdminPanel from './components/AdminPanel';
import AISuggestion from './components/AISuggestion';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleEmailSet = (email) => {
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
  };

  const tabs = [
    { id: 'rooms', label: 'Available Rooms' },
    { id: 'book', label: 'Book a Room' },
    { id: 'my-bookings', label: 'My Bookings' },
    { id: 'ai-suggest', label: 'AI Suggestions' },
    { id: 'admin', label: 'Admin Panel' }
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 Azure Classroom Booking System</h1>
        <div className="user-info">
          {!userEmail ? (
            <div className="email-input">
              <input
                type="email"
                placeholder="Enter your email and press Enter"
                defaultValue=""
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    handleEmailSet(e.target.value);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    handleEmailSet(e.target.value);
                  }
                }}
              />
            </div>
          ) : (
            <div className="user-email-display">
              <span>👤 {userEmail}</span>
              <button 
                className="btn-change-email"
                onClick={() => {
                  setUserEmail('');
                  localStorage.removeItem('userEmail');
                }}
              >
                Change
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'rooms' && <RoomList />}
        {activeTab === 'book' && <BookingForm userEmail={userEmail} />}
        {activeTab === 'my-bookings' && <MyBookings userEmail={userEmail} />}
        {activeTab === 'ai-suggest' && <AISuggestion />}
        {activeTab === 'admin' && <AdminPanel isAdmin={isAdmin} setIsAdmin={setIsAdmin} />}
      </main>

      <footer className="footer">
        <p>Built with React + Azure Functions + Cosmos DB | Cloud Project 2025</p>
      </footer>
    </div>
  );
}

export default App;
