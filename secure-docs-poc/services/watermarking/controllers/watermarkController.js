// services/watermarking/controllers/watermarkController.js

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const buildWatermarkText = require('../utils/watermarkBuilder');

const OMNISEAL_API_URL = 'https://app.purecipher.com/api/v1/unified/embed';
const OMNISEAL_API_KEY = process.env.OMNISEAL_API_KEY;
const OMNISEAL_PRIVATE_SEED = process.env.OMNISEAL_PRIVATE_SEED;

const generateWatermark = async (req, res) => {
  try {
    const { originalFilename, redactedFilePath } = req.body;

    if (!originalFilename || !redactedFilePath) {
      return res.status(400).json({ error: 'Missing originalFilename or redactedFilePath in request.' });
    }

    // Step 1: Load the redacted DOCX file
    const redactedBuffer = await fs.readFile(path.resolve(redactedFilePath));
    const redactedBase64 = redactedBuffer.toString('base64');

    // Step 2: Generate watermark text
    const watermarkText = await buildWatermarkText(originalFilename);

    // Step 3: Convert watermark text to base64
    const watermarkBuffer = Buffer.from(watermarkText, 'utf-8');
    const watermarkBase64 = watermarkBuffer.toString('base64');

    // Step 4: Prepare payload
    const payload = {
      cover_file_base64: redactedBase64,
      cover_file_name: path.basename(redactedFilePath),
      secret_file_base64: watermarkBase64,
      secret_file_name: `${originalFilename}-WATERMARK.txt`,
      private_seed: OMNISEAL_PRIVATE_SEED
    };

    // Step 5: Send request to OmniSeal Unified API
    const response = await axios.post(OMNISEAL_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${OMNISEAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const embeddedFileBase64 = response.data?.embedded_file_base64;

    if (!embeddedFileBase64) {
      return res.status(500).json({ error: 'OmniSeal response did not contain expected output.' });
    }

    // Step 6: Save the embedded file to disk (optional: you can also stream it or return directly)
    const outputPath = path.resolve(
      path.dirname(redactedFilePath),
      `${path.parse(redactedFilePath).name}-with-watermark.docx`
    );
    await fs.writeFile(outputPath, Buffer.from(embeddedFileBase64, 'base64'));

    // Step 7: Respond to client
    res.json({
      message: 'Watermark embedded successfully',
      watermarkedFilePath: outputPath
    });

  } catch (err) {
    console.error('❌ Watermarking error:', err);
    res.status(500).json({ error: 'Failed to embed watermark', details: err.message });
  }
};

module.exports = { generateWatermark };