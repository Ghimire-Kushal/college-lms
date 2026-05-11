const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: String,
  fileType: String,
  fileName: String,
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
