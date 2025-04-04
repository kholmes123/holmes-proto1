// services/pii-detection/utils/generatePlaceholders.js

/**
 * Generates consistent placeholders for PII elements.
 * Ensures that repeated originalText values get the same placeholder.
 */

function generatePlaceholders(piiElements) {
    const placeholderMap = {}; // Map from originalText to placeholder
    const typeCounters = {};   // Track counter per type
    const mappings = [];       // Output mapping array
  
    for (const element of piiElements) {
      const { type, originalText } = element;
  
      if (!placeholderMap[originalText]) {
        if (!typeCounters[type]) typeCounters[type] = 0;
        const placeholder = `[${type.toUpperCase()}_${typeCounters[type]}]`;
        placeholderMap[originalText] = placeholder;
        typeCounters[type]++;
  
        mappings.push({ original: originalText, placeholder, type });
      }
    }
  
    return { placeholderMap, mappings };
  }
  
  module.exports = generatePlaceholders;
  