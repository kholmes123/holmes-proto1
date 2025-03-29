const mongoose = require('mongoose');

const piiMappingSchema = new mongoose.Schema({
  originalText: String,
  placeholder: String,
  type: String,
  fileId: mongoose.Schema.Types.ObjectId,
  originalFilename: String,
  genericFilename: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PiiMapping', piiMappingSchema);