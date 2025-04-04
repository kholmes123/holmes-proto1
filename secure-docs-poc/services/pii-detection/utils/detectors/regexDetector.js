// services/pii-detection/utils/piiRegexEngine.js

// FUTURE FIX:  This regex makes errors with adjoining underscores or other characters on at least SSN and name. Make it more robust later. 
// FUTURE FIX:  This regex creates new placeholders for the same original text each time. No re-use

const regexPatterns = {
    name: /(?<!\w)[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g, // Simplified full name matcher
    phone: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi
  };
  
  function detectPIIAndRedact(text, originalFilename = 'unknown.docx') {
    const matches = [];
    let redactedText = text;
    const auditLog = [];
  
    Object.entries(regexPatterns).forEach(([type, pattern]) => {
      const found = [...text.matchAll(pattern)];
      found.forEach((match, index) => {
        const placeholder = `[${type.toUpperCase()}_${index}]`;
        redactedText = redactedText.replace(match[0], placeholder);
        
        matches.push({
          originalText: match[0],
          placeholder,
          type
        });
        
        auditLog.push({
          placeholder,
          matchedText: match[0],
          matchType: type,
          originalFilename
        });

      });
    });
  
    return { redactedText, matches, auditLog };
  }
  
  module.exports = detectPIIAndRedact;