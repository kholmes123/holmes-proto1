const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Define backend microservice endpoints
const REDACTION_URL = 'http://localhost:3009/redact/docx'; // file-redaction
const WATERMARK_URL = 'http://localhost:3012/watermark';   // watermarking

const handleFileUpload = async (req, res) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalFilePath = uploadedFile.path;
    const originalFilename = uploadedFile.originalname;

    const ext = path.extname(originalFilename).toLowerCase();

    if (ext !== '.docx') {
      return res.status(400).json({ error: 'Only DOCX files are supported for now.' });
    }

    // Step 1: Send file to redaction service
    const redactionForm = new FormData();
    redactionForm.append('file', fs.createReadStream(originalFilePath));

    const redactionResponse = await axios.post(REDACTION_URL, redactionForm, {
      headers: redactionForm.getHeaders(),
    });

    const redactedFilePath = redactionResponse.data?.filePath;

    if (!redactedFilePath) {
      throw new Error('Redacted file path missing in redaction response');
    }

    // Step 2: Send redacted file to watermarking service
    const watermarkResponse = await axios.post(WATERMARK_URL, {
      originalFilename,
      redactedFilePath
    });

    // Final response to frontend
    res.status(200).json({
      message: '✅ File processed successfully.',
      redactedFile: redactedFilePath,
      watermarkedFile: watermarkResponse.data?.filePath || 'See logs or filesystem',
    });

  } catch (err) {
    console.error('❌ Upload handling failed:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { handleFileUpload };