const mongoose = require('mongoose');

const STREAMS = ['Science', 'Management', 'Humanities', 'Education', 'Law', 'Computer Science', 'Hotel Management'];

const courseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  code:        { type: String, required: true, unique: true, uppercase: true },
  description: String,
  grade:       { type: Number, enum: [11, 12], required: true }, // Class 11 or 12
  stream:      { type: String, enum: STREAMS, required: true },  // Science / Management…
  section:     String,                                           // optional A/B/C
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
