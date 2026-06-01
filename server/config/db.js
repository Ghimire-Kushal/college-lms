const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize:     100,   // was 5 — allows 100 simultaneous DB operations
      minPoolSize:     10,    // keep 10 connections warm at all times
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS:   60000,
    });

    // Add indexes critical for peak-load queries
    mongoose.connection.once('open', async () => {
      try {
        const db = mongoose.connection.db;
        // Submission: findOne({ assignment, student }) is the hot path on deadline
        await db.collection('submissions').createIndex(
          { assignment: 1, student: 1 },
          { unique: true, background: true }
        );
        // Attendance: frequently queried by course + date
        await db.collection('attendances').createIndex(
          { course: 1, date: -1 },
          { background: true }
        );
        // Notifications: per-user, sorted by date
        await db.collection('notifications').createIndex(
          { recipient: 1, createdAt: -1 },
          { background: true }
        );
      } catch {
        // Indexes may already exist — safe to ignore
      }
    });

    console.log(`MongoDB connected (pool: 100)`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
