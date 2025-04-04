const axios = require('axios');
const fs = require('fs');
const path = require('path');

const OMNISEAL_API_KEY = process.env.OMNISEAL_API_KEY;
const OMNISEAL_PRIVATE_SEED = process.env.OMNISEAL_PRIVATE_SEED;
const OMNISEAL_RETRIEVE_URL = 'https://api.purecipher.com/unified/retrieve';

async function retrieveWatermark(sealedFilePath) {
  const sealedBuffer = fs.readFileSync(path.resolve(sealedFilePath));
  const sealedBase64 = sealedBuffer.toString('base64');

  const requestBody = {
    sealed_file_base64: sealedBase64,
    sealed_file_name: path.basename(sealedFilePath),
    private_seed: OMNISEAL_PRIVATE_SEED,
  };

  try {
    const response = await axios.post(OMNISEAL_RETRIEVE_URL, requestBody, {
      headers: {
        api_token: OMNISEAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    console.log('🔍 OmniSeal response:', JSON.stringify(response.data, null, 2));
    const extractedBase64 = response?.data?.result?.secret;

    if (!extractedBase64) {
      throw new Error('❌ retrieveWatermark: Missing extracted_file_base64 in API response');
    }

    const watermarkText = Buffer.from(extractedBase64, 'base64').toString('utf8');
    return watermarkText;

  } catch (err) {
    console.error('❌ Failed to retrieve watermark:', err.message);
    throw err;
  }
}

module.exports = retrieveWatermark;