const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  internalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  grade: String,
  remarks: String,
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
