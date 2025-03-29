const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  originalFilename: {
    type: String,
    required: true
  },
  matchType: {
    type: String, // e.g., "REGEX", "NLP"
    required: true
  },
  matchedText: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    required: true
  },
  regexPattern: {
    type: String,
    required: false
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PiiMapping', // optional if you want traceability
    required: false
  },
  notes: {
    type: String,
    required: false
  }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;