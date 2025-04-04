// controllers/retrieveController.js
require('dotenv').config();
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const OMNISEAL_RETRIEVE_URL = 'https://api.purecipher.com/unified/retrieve';
const OMNISEAL_API_KEY = process.env.OMNISEAL_API_KEY;
const OMNISEAL_PRIVATE_SEED = process.env.OMNISEAL_PRIVATE_SEED;

const retrieveWatermark = async (req, res) => {
  try {
    const { sealedFilePath } = req.body;

    if (!fs.existsSync(sealedFilePath)) {
      return res.status(400).json({ error: 'File not found on disk' });
    }

    const sealedFileBuffer = fs.readFileSync(path.resolve(sealedFilePath));
    const sealedFileBase64 = sealedFileBuffer.toString('base64');

    const requestBody = {
      sealed_file_base64: sealedFileBase64,
      sealed_file_name: path.basename(sealedFilePath),
      private_seed: OMNISEAL_PRIVATE_SEED
    };

    const response = await axios.post(OMNISEAL_RETRIEVE_URL, requestBody, {
      headers: {
        api_token: OMNISEAL_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const watermarkBase64 = response?.data?.result?.secret_file_base64;
    const watermarkBuffer = Buffer.from(watermarkBase64, 'base64');
    const decodedText = watermarkBuffer.toString('utf8');

    // Option 1: send text directly in response (for browser viewing)
    res.status(200).json({
      message: '✅ Watermark retrieved successfully.',
      content: decodedText
    });

    // Option 2: optionally also save to disk (dev/testing only)
    const outputPath = path.resolve(
      path.dirname(sealedFilePath),
      `retrieved-watermark-${Date.now()}.txt`
    );
    fs.writeFileSync(outputPath, decodedText);
    console.log(`📥 Watermark content saved to: ${outputPath}`);

  } catch (err) {
    console.error('❌ Error retrieving watermark:', err.message);
    res.status(500).json({
      error: 'Failed to retrieve watermark.',
      details: err.message
    });
  }
};

module.exports = { retrieveWatermark };
