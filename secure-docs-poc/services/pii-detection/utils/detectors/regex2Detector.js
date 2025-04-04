// /services/pii-detection/utils/regex2Detector.js
/*  This code will evemtually replace the old regexDetector.js so that placeholders are reused when the same token is encountered
    1.	Detect matches using regex (as you already do).
	2.	Call generatePlaceholders(piiArray) to assign consistent placeholders.
	3.	Replace text using placeholderMap.
	4.	Return both redactedText and mappings in your detection API response. */ 


const generatePlaceholders = require('../utils/generatePlaceholders');

function detectPiiWithRegex(text) {
  const piiMatches = [];

  // Sample regex patterns
  const patterns = [
    { type: 'name', regex: /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g },
    { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi },
    { type: 'phone', regex: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g },
    { type: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g }
  ];

  // Step 1: Find all matches with types
  for (const { type, regex } of patterns) {
    const matches = [...text.matchAll(regex)];
    for (const match of matches) {
      piiMatches.push({
        original: match[0],
        type
      });
    }
  }

  // Step 2: Generate consistent placeholders
  const { placeholderMap, mappings } = generatePlaceholders(piiMatches);

  // Step 3: Redact text
  let redactedText = text;
  for (const [original, placeholder] of Object.entries(placeholderMap)) {
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedOriginal}\\b`, 'g');
    redactedText = redactedText.replace(regex, placeholder);
  }

  return { redactedText, mappings };
}

module.exports = async function (text, originalFilename) {
  const { redactedText, mappings } = detectPiiWithRegex(text);

  // Optional audit log (if needed by your database schema)
  const auditLog = mappings.map((m, index) => ({
    original: m.original,
    placeholder: m.placeholder,
    type: m.type,
    context: 'regex2',
    index,
    file: originalFilename
  }));

  return { redactedText, matches: mappings, auditLog };
};

