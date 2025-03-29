const mongoose = require('mongoose');

const piiLogSchema = new mongoose.Schema({
  patternName: String,
  match: String,
  index: Number,
  type: String,
  fileId: mongoose.Schema.Types.ObjectId,
  originalFilename: String,
  genericFilename: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PiiLog', piiLogSchema);