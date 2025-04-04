// services/watermarking/utils/watermarkBuilder.js

const PiiMapping = require('../../pii-detection/models/PiiMapping');

/**
 * Build watermark text from PiiMapping records
 * @param {string} originalFilename - Original filename to query
 * @param {string} username - Name of the user who ran redaction
 * @param {string} userNote - Any comment the user entered at runtime
 * @returns {string} - Formatted watermark text
 */
async function buildWatermarkText(originalFilename, username = 'UNKNOWN_USER', userNote = '') {
  const mappingRecord = await PiiMapping.findOne({ originalFilename });

  if (!mappingRecord) {
    throw new Error(`No PII mapping found for filename: ${originalFilename}`);
  }

  const { piiMappings } = mappingRecord;

  let watermarkText = `${originalFilename.toUpperCase()}\n\n`;
  watermarkText += `Created by: ${username}\n`;
  watermarkText += `Created at: ${new Date().toISOString()}\n`;
  if (userNote) {
    watermarkText += `Note: ${userNote}\n`;
  }
  watermarkText += `\nExtracted PII mappings:\n`;

  piiMappings.forEach(({ originalText, placeholder, type }) => {
    watermarkText += `${originalText} → ${placeholder} [${type}]\n`;
  });

  return watermarkText;
}

module.exports = buildWatermarkText;