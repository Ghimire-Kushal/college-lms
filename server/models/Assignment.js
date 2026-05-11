const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  fileUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
