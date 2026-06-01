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
        // Users: email lookup on every login — CRITICAL for auth performance
        await db.collection('users').createIndex(
          { email: 1 },
          { unique: true, background: true }
        );
        // Users: role-based queries (admin listing students/teachers)
        await db.collection('users').createIndex(
          { role: 1, isActive: 1 },
          { background: true }
        );
        // Results: per-student queries
        await db.collection('results').createIndex(
          { student: 1, semester: 1 },
          { background: true }
        );
        // Timetable: the slowest collection in benchmark
        await db.collection('timetables').createIndex(
          { dayOfWeek: 1, semester: 1, section: 1 },
          { background: true }
        );
        // Assignments: per-course deadline queries
        await db.collection('assignments').createIndex(
          { course: 1, dueDate: 1 },
          { background: true }
        );
        console.log('MongoDB indexes verified');
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
