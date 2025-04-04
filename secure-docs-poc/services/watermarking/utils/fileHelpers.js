// utils/fileHelpers.js
const fs = require('fs');
const path = require('path');

function saveWatermarkedFile(redactedFilePath, response) {
    try {
      const embeddedFileBase64 = response?.data?.result?.sealed_file;
      const extension = response?.data?.result?.extension;
  
      if (!embeddedFileBase64 || !extension) {
        throw new Error('Missing sealed_file or extension in API response');
      }
  
      const outputFilePath = path.resolve(
        path.dirname(redactedFilePath),
        `watermarked-${path.basename(redactedFilePath, path.extname(redactedFilePath))}.${extension}`
      );
  
      const outputBuffer = Buffer.from(embeddedFileBase64, 'base64');
      fs.writeFileSync(outputFilePath, outputBuffer);
      console.log(`✅ Watermarked file saved: ${outputFilePath}`);
    } catch (err) {
      console.error('🛑 Error inside saveWatermarkedFile:', err);
      throw err; // Rethrow to bubble it up to watermarkController.js
    }
  }

  module.exports = {
    saveWatermarkedFile
  };