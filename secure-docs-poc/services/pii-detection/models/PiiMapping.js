const mongoose = require('mongoose');

// Define the schema for PII mappings as a single document with an array of all of the mappings performed on each processed file
// The schema includes the original filename, generic filename, and an array of mappings
// Pros:
// - Easy to query all mappings for a specific file
// - Simple structure
// Cons:
// - Can become too large and even hit MongoDB document size limits  if many files are processed
// Harder to query across all mappings (e.g. find all mappings of a specific type, such as [NAME] across all files ever processed)



// Define a subdocument schema for each PII mapping entry.
// This makes Mongoose treat each mapping as an object, not a plain string.
const piiEntrySchema = new mongoose.Schema({
  originalText: { type: String, required: true },    // The original PII string found
  placeholder: { type: String, required: true },      // The placeholder used to redact it
  type: { type: String, required: true }              // The type of PII (e.g., name, email, ssn, phone)
}, { _id: false }); // Disable _id field for subdocuments unless you need it

// Define the main schema for storing mappings for an entire processed file
const piiMappingSchema = new mongoose.Schema({
  originalFilename: { type: String, required: true }, // The name of the original uploaded file
  genericFilename: { type: String, required: true },  // The anonymized/redacted output filename

  // Create an array of subdocuments, each describing one redacted element
  piiMappings: {
    type: [piiEntrySchema], // Must be an array of piiEntrySchema objects
    required: true,
    validate: v => Array.isArray(v) && v.length > 0 // Optional: ensure it's a non-empty array
  },

  // Timestamp for when this document was created (auto-managed)
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PiiMapping', piiMappingSchema);