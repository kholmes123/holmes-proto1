require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const buildWatermarkText = require('../utils/watermarkBuilder');
const { saveWatermarkedFile } = require('../utils/fileHelpers');
const retrieveWatermark = require('../utils/retrieveWatermark');

const OMNISEAL_API_URL = 'https://api.purecipher.com/unified/embed';
const OMNISEAL_API_KEY = process.env.OMNISEAL_API_KEY;
const OMNISEAL_PRIVATE_SEED = process.env.OMNISEAL_PRIVATE_SEED;

const generateWatermark = async (req, res) => {

  // Debug
  console.log('🚀 beginning watermarking Request body with this req.body:', req.body);
  try {
    const { originalFilename, redactedFilePath, genericFilename } = req.body;

    // ✅ Step 1: Build the watermark text from DB mappings
    const watermarkText = await buildWatermarkText(originalFilename);

    // ✅ Step 2: Convert redacted DOCX (cover file) to base64
    const redactedBuffer = fs.readFileSync(path.resolve(redactedFilePath));
    const redactedBase64 = redactedBuffer.toString('base64');

    // ✅ Step 3: Convert watermark string to base64 (secret file)
    const watermarkBuffer = Buffer.from(watermarkText, 'utf8');
    const watermarkBase64 = watermarkBuffer.toString('base64');

    // ✅ Step 4: Prepare API request body
    const requestBody = {
      cover_file_base64: redactedBase64,
      cover_file_name: path.basename(redactedFilePath),
      secret_file_base64: watermarkBase64,
      secret_file_name: `${path.basename(originalFilename)}_watermark.txt`,
      private_seed: OMNISEAL_PRIVATE_SEED,
    };

    // ✅ Step 5: Call OmniSeal Unified API
    const response = await axios.post(OMNISEAL_API_URL, requestBody, {
      headers: {
        api_token: OMNISEAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    // ✅ Step 6: Save the watermarked file
    saveWatermarkedFile(redactedFilePath, response);

    // ✅ Step 7: Verify the saved watermark
    const watermarkedFilePath = path.resolve(
      path.dirname(redactedFilePath),
      `watermarked-${path.basename(redactedFilePath)}`
    );

    const extractedText = await retrieveWatermark(watermarkedFilePath);

    // Debug:   check the watermark text attached to the file and the extracted text after the watermarking process
    console.log('🔍 Watermark text:', watermarkText)
    console.log('🔍 Extracted text:', extractedText);

    // Compare extracted watermark to the expected text
    let verificationMessage;
    if (extractedText.trim() === watermarkText.trim()) {
      verificationMessage = '✅ Watermark verification successful. Text matches.';
      console.log(verificationMessage);
    } else {
      verificationMessage = '⚠️ Watermark verification failed. Text does NOT match.';
      console.warn(verificationMessage);
      console.warn('🔍 Extracted:', extractedText);
      console.warn('📝 Expected:', watermarkText);
    }

    // ✅ Send back full details
    res.status(200).json({
      message: '✅ Watermarking complete and file saved successfully.',
      verification: verificationMessage,
      watermarkText: extractedText, // This is the watermark string extracted from the watermarked file
      originalFilename,
      genericFilename
    });

  } catch (err) {
    // 🔥 Catch errors from ANY step
    console.error('❌ Watermarking failed during processing:', err.message);
    console.error(err.stack);
    if (!res.headersSent) {
      res.status(500).json({
        error: '❌ Watermarking failed during processing.',
        details: err.message,
      });
    }
  }
};

module.exports = { generateWatermark };
