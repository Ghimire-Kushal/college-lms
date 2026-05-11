const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: String,
  semester: Number,
  section: String,
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
