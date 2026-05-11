const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: String,
  content: String,
  marks: Number,
  feedback: String,
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
