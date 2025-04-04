//docxRedactionService.js


// Import required modules
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs-extra');
const path = require('path');
const { Packer, Paragraph, Document } = require('docx');

// Load environment variables
dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// API to accept redacted text and mappings, generate redacted Word doc
app.post('/insert-redacted-text', upload.single('file'), async (req, res) => {
  try {
    const genericFilename = req.body.genericFilename || `redacted-${Date.now()}.docx`;
    const filePath = req.file.path;
    const { redactedText } = req.body;

    // Rebuild document from redacted text
    const lines = redactedText.split('\n');
    const paragraphs = lines.map(line => new Paragraph(line));
    const doc = new Document({ sections: [{ children: paragraphs }] });

    const outputBuffer = await Packer.toBuffer(doc);
    const outputFile = path.join('uploads', genericFilename);
    fs.writeFileSync(outputFile, outputBuffer);
    fs.unlinkSync(filePath);

    res.download(outputFile, () => fs.unlinkSync(outputFile));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Redaction failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Redaction service running on port ${PORT}`));
