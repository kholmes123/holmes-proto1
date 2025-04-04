// services/file-redaction/fileRedactionService.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const docxRedactionRoutes = require('./routes/docxRedactionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve redacted files (optional for testing)
app.use('/redacted-files', express.static(path.join(__dirname, 'uploads')));

// Route mounting
app.use('/redaction', docxRedactionRoutes);

// Start server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🧾 File Redaction service running on port ${PORT}`);
});