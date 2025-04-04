// file-redaction/utils/docxRedactor.js

// This utility is the core business logic of performing redaction 

// It contains a function named rebuildDocxFromRedactedText that takes:
//	•	The redacted text with PII replaced by placeholders,
//	•	A generic filename for the output,
//	•	An optional output directory (uploads by default),
//…and then rebuilds a .docx file with that content. 


const fs = require('fs-extra');
const path = require('path');
const { Packer, Paragraph, Document } = require('docx');

/**
 * Rebuilds a DOCX file from redacted text and saves it.
 * @param {string} redactedText - The fully redacted text (with placeholders).
 * @param {string} genericFilename - The desired output filename.
 * @param {string} outputDir - Directory to save the file.
 * @returns {string} Full path to the saved file.
 */
async function rebuildDocxFromRedactedText(redactedText, genericFilename, outputDir = 'uploads') {
  const lines = redactedText.split('\n');
  const paragraphs = lines.map(line => new Paragraph(line));
  const doc = new Document({ sections: [{ children: paragraphs }] });

  const outputBuffer = await Packer.toBuffer(doc);
  const outputFilePath = path.join(outputDir, genericFilename);
  await fs.writeFile(outputFilePath, outputBuffer);

  return outputFilePath;
}

module.exports = {
  rebuildDocxFromRedactedText,
};
