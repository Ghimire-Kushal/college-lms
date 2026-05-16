const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'GOOGLE_SHEETS_IMPORT',
        'STUDENT_CREATE',
        'STUDENT_UPDATE',
        'STUDENT_DELETE',
        'TEACHER_CREATE',
        'TEACHER_UPDATE',
        'TEACHER_DELETE',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    // Summary or per-record details stored here
    details: { type: mongoose.Schema.Types.Mixed },
    // Overall outcome
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
  },
  { timestamps: true }
);

// Index for fast admin audit queries
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
