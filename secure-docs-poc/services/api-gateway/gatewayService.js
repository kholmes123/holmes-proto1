const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const FormData = require('form-data');

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/process-docx', upload.single('file'), async (req, res) => {
  try {
    const engine = req.body.engine || 'regex';
    const filePath = path.resolve(req.file.path);

    const originalFilename = req.file?.originalname || 'unknown.docx';

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath)); // ✅ the actual file
    form.append('originalFilename', originalFilename);  // ✅ just metadata, not a file itself
    

    let detectionUrl;
    if (engine === 'regex') {
      detectionUrl = 'http://localhost:3007/detect-pii-docx';
    } else if (engine === 'nlp') {
      detectionUrl = 'http://localhost:3009/detect-nlp-docx';
    } else {
      return res.status(400).json({ error: 'Unsupported PII detection engine specified.' });
    }

    // Step 1: Detect PII
    const detectResponse = await axios.post(detectionUrl, form, { headers: form.getHeaders() });
    const { redactedText, mappings, genericFilename } = detectResponse.data;

    // Step 2: Forward to Redaction Service
    const redactionForm = new FormData();
    redactionForm.append('file', fs.createReadStream(filePath));
    redactionForm.append('redactedText', redactedText);
    redactionForm.append('piiMappings', JSON.stringify(mappings));
    redactionForm.append('genericFilename', genericFilename); // ✅ Add this line


    // OPTIONAL - Debug logging of the file sending
    console.log('DEBUG: About to send file to detection service');
    console.log('File exists:', fs.existsSync(filePath));
    console.log('Detection URL:', detectionUrl);
    console.log('Form headers:', form.getHeaders());

    // END DEBUG LOGGING

    const redactResponse = await axios.post(
      'http://localhost:3006/insert-redacted-text',
      redactionForm,
      { headers: redactionForm.getHeaders(), responseType: 'stream' }
    );

    fs.unlinkSync(filePath);

    // update the response headers to include the anonymized filename
    res.setHeader('Content-Disposition', `attachment; filename="${genericFilename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    
    redactResponse.data.pipe(res);
  } catch (err) {
    console.error('Gateway error:', err);
    res.status(500).json({ error: 'Processing failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`Gateway service running on port ${PORT}`));