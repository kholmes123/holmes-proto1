const fs = require('fs-extra');
const path = require('path');
const { Document, Packer, Paragraph } = require('docx');

async function rebuildDocxFromRedactedText(redactedText, genericFilename) {
  // ✅ Type check
  if (typeof genericFilename !== 'string') {
    console.trace('🚨 Invalid filename: must be a string');
    throw new Error('❌ rebuildDocxFromRedactedText: filename must be a string');
  }

  console.log('📄 Filename type:', typeof genericFilename, '| Value:', genericFilename);

  const lines = redactedText.split('\n');
  const paragraphs = lines.map(line => new Paragraph(line));
  const doc = new Document({ sections: [{ children: paragraphs }] });

  const buffer = await Packer.toBuffer(doc);
  const outputFile = path.join(__dirname, '..', 'uploads', genericFilename);
  await fs.writeFile(outputFile, buffer);

    // Debug
    console.log('✅ About to return this path to controller:', outputFile);
    console.log('✅ Type of outputFile:', typeof outputFile);

  return outputFile;
}

module.exports = rebuildDocxFromRedactedText;