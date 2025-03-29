// services/watermarking/utils/watermarkBuilder.js

const PiiMapping = require('../../pii-detection/models/PiiMapping');

/**
 * Build watermark content from MongoDB redaction mappings.
 * @param {string} originalFilename - The original file's name used as lookup key.
 * @returns {string} Watermark text to be embedded.
 */
async function buildWatermarkText(originalFilename) {
  // Fetch the PII mapping record associated with the original file
  const mappingRecord = await PiiMapping.findOne({ originalFilename });

  if (!mappingRecord) {
    throw new Error(`No mapping found for filename: ${originalFilename}`);
  }

  const { piiMappings } = mappingRecord;

  // Header includes the original file name in uppercase, followed by two new lines
  let watermarkText = `${originalFilename.toUpperCase()}\n\n`;

  // Append each PII match and its replacement to the watermark
  piiMappings.forEach(({ original, placeholder }) => {
    watermarkText += `${original} -> ${placeholder}\n`;
  });

  return watermarkText;
}

module.exports = buildWatermarkText;