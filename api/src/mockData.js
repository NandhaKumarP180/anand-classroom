// Mock data for local testing without Cosmos DB

let rooms = [
  {
    id: "r101",
    name: "Room 101",
    building: "A",
    capacity: 30,
    features: ["projector", "whiteboard"],
    active: true
  },
  {
    id: "r102",
    name: "Room 102",
    building: "A",
    capacity: 50,
    features: ["projector", "audio-system"],
    active: true
  },
  {
    id: "r201",
    name: "Room 201",
    building: "B",
    capacity: 40,
    features: ["projector", "whiteboard", "smart-board"],
    active: true
  },
  {
    id: "r202",
    name: "Room 202",
    building: "B",
    capacity: 25,
    features: ["whiteboard"],
    active: true
  },
  {
    id: "r301",
    name: "Lab 301",
    building: "C",
    capacity: 35,
    features: ["computers", "projector"],
    active: true
  }
];

let bookings = [
  {
    id: "b001",
    roomId: "r101",
    requesterEmail: "john.doe@college.edu",
    requesterName: "John Doe",
    purpose: "Guest Lecture on Cloud Computing",
    startIso: "2025-11-05T10:00:00Z",
    endIso: "2025-11-05T12:00:00Z",
    status: "approved",
    createdAtIso: "2025-11-03T08:00:00Z",
    approvedAtIso: "2025-11-03T09:00:00Z"
  },
  {
    id: "b002",
    roomId: "r201",
    requesterEmail: "jane.smith@college.edu",
    requesterName: "Jane Smith",
    purpose: "Workshop on AI/ML",
    startIso: "2025-11-06T14:00:00Z",
    endIso: "2025-11-06T17:00:00Z",
    status: "pending",
    createdAtIso: "2025-11-03T10:00:00Z"
  }
];

module.exports = {
  getAllRooms: () => rooms,
  getAllBookings: () => bookings,
  getBookingById: (id) => bookings.find(b => b.id === id),
  createBooking: (booking) => {
    const newBooking = {
      id: `b${Date.now()}`,
      ...booking,
      status: 'pending',
      createdAtIso: new Date().toISOString()
    };
    bookings.push(newBooking);
    return newBooking;
  },
  updateBooking: (id, updates) => {
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      return bookings[index];
    }
    return null;
  }
};
