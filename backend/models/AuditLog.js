const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  targetModel: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  details: {
    type: Object,
    default: {}
  }
});

// Prevent any updates or deletes — append only
auditLogSchema.pre(['updateOne', 'findOneAndUpdate', 'deleteOne', 'findOneAndDelete'], function() {
  throw new Error('AuditLog is append-only. Updates and deletes are not allowed.');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);