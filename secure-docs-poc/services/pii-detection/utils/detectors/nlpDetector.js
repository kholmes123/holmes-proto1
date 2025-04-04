module.exports = async function detectPII(text, originalFilename) {
    return {
      redactedText: text,
      matches: [],
      auditLog: [],
    };
  };