// services/file-redaction/controllers/docxRedactionController.js

// Acts as the handler for the route named doxRedactionRoute , accept the uploaded file and redacted text, and call the docxRedaction.js utility that performs the business logic of redaction :

const path = require('path');
const fs = require('fs-extra');
const rebuildDocxFromRedactedText = require('../utils/rebuildDocxFromRedactedText');

const handleDocxRedaction = async (req, res) => {
  try {
    const filePath = req.file?.path;
    let { redactedText, genericFilename } = req.body;

    if (!filePath || !redactedText) {
      return res.status(400).json({ error: 'Missing required inputs (file or redactedText).' });
    }

    // Fallback if genericFilename is missing or not a string
    if (typeof genericFilename !== 'string' || genericFilename.trim() === '') {
      const timestamp = Date.now();
      genericFilename = `fallback-${timestamp}.docx`;
      console.warn(`⚠️ genericFilename was invalid. Using fallback: ${genericFilename}`);
    }

    // 🔧 Rebuild redacted file
    const outputPath = await rebuildDocxFromRedactedText(redactedText, genericFilename);

    // 🧹 Cleanup
    await fs.unlink(filePath);

    // Debug
    console.log('🛣️ Sending file path to res.download():', outputPath);
    console.log('🧪 Type of outputPath:', typeof outputPath);
    if (typeof outputPath !== 'string') {
      console.error('❌ outputPath is not a string! It is:', typeof outputPath, '| Value:', outputPath);
    }

    // ✅ Respond with rebuilt file
    res.download(outputPath, () => fs.unlink(outputPath));

  } catch (err) {
    console.error('❌ Error in docxRedactionController:', err.message);
    console.error('🧵 Full stack:', err.stack);
    res.status(500).json({
      error: 'Failed to rebuild and serve redacted DOCX file',
      details: err.message,
    });
  }
};

module.exports = { handleDocxRedaction };