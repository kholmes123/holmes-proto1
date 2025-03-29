// services/pii-detection/piiDetectionService.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const mammoth = require('mammoth');

const detectPIIAndRedact = require('./utils/piiRegexEngine');
const PiiMapping = require('./models/PiiMapping');
const PiiLog = require('./models/PiiLog');
const AuditLog = require('./models/AuditLog');

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'piiredactor',
});
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

// Route to detect PII in .docx files
app.post('/detect-pii-docx', upload.single('file'), async (req, res) => {
  try {
    const uploadedFile = req.file;
    const filePath = path.resolve(uploadedFile.path);
    const originalFilename = uploadedFile.originalname || 'unknown.docx';

    // Extract text from DOCX
    const fileBuffer = fs.readFileSync(filePath);
    const { value: extractedText } = await mammoth.extractRawText({ buffer: fileBuffer });

    // Run PII detection
    const { redactedText, matches : mappings, auditLog } = await detectPIIAndRedact(extractedText, originalFilename);

    // Generate generic file name for redacted output
    const timestamp = Date.now();
    const genericFilename = `file-${timestamp}-${Math.random().toString(36).substring(2, 8)}.docx`;

    // Save redaction mappings in MongoDB
    await PiiMapping.create({
      originalFilename,
      genericFilename,
      piiMappings: mappings,
    });

    // DEBUG STEP: Save the shape/structure of audit log
    console.log('📋 Audit log about to be saved:', JSON.stringify(auditLog, null, 2));

    // Save audit log documents
    for (const entry of auditLog) {
      await AuditLog.create({
        ...entry, // includes placeholder, matchedText, matchType, originalFilename
        timestamp: new Date()
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return redacted data
    res.json({ redactedText, mappings, genericFilename });

  } catch (err) {
    console.error('❌ Detection service error:', err);
    res.status(500).json({ error: 'Failed to process DOCX file', details: err.message });
  }
});

// Start service
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`📌 PII detection service running on port ${PORT}`));