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

    // this line was added to makes sure you pull from req.body.originalFilename first, which is the good filename sent by the gateway, instead of using the hash name
    const originalFilename = req.body.originalFilename || uploadedFile.originalname || 'unknown.docx'; 

    // Extract text from DOCX
    const fileBuffer = fs.readFileSync(filePath);
    const { value: extractedText } = await mammoth.extractRawText({ buffer: fileBuffer });

    // Run PII detection
    const { redactedText, matches : mappings, auditLog } = await detectPIIAndRedact(extractedText, originalFilename);

    // TEMPORARY DEBUG: check the type of the mappings to be sure it is an array and not a string
    console.log('✅ Type of mappings:', typeof mappings);
    console.log('📦 Mappings:', mappings);

    // Generate generic file name for redacted output
    const timestamp = Date.now();
    const genericFilename = `file-${timestamp}-${Math.random().toString(36).substring(2, 8)}.docx`;

    // DEBUG:  Check the type of the mappings (it should be an array of objects and not a string)
    console.log('📦 Mappings (typeof):', typeof mappings);
    console.log('📦 Mappings (actual value):', mappings);
    console.log('✅ mappings isArray:', Array.isArray(mappings));
    console.log('✅ mappings type:', typeof mappings);

    // Because of a cast error that was getting thrown, this is an additional debug step to ensure the type for mappings was not changed to string.  avaScript’s typeof checks what the variable currently is at that moment.
	  // 	It’s possible that mappings was an array earlier, but something changed it after the logs and before the PiiMapping.create() call.
    console.log('ABOUT TO DO THE FAIL SAFE CHECK to parse JSON strin if it somehow got converted to a string');
    if (typeof mappings === 'string') {
      console.warn('⚠️ mappings was a string — parsing to fix');
      mappings = JSON.parse(mappings);
    }

    // Save redaction mappings in MongoDB
    await PiiMapping.create({
      originalFilename,
      genericFilename,
      piiMappings: mappings, // must be an array of {originalText, placeholder, type}
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