const mongoose = require('mongoose');

const onlineClassSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  meetLink:    { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration:    { type: Number, default: 60 },
  description: { type: String, default: '' },
  platform:    { type: String, enum: ['zoom', 'meet', 'teams', 'other'], default: 'meet' },
}, { timestamps: true });

module.exports = mongoose.model('OnlineClass', onlineClassSchema);
