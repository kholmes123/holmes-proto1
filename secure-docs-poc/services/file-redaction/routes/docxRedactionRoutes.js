// services/file-redaction/routes/docxRedactionRoutes.js

// This route defintion  wires up the Express route to the docxRedactionController function using Multer for file upload:

const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleDocxRedaction } = require('../controllers/docxRedactionController');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

// POST /redact-docx
router.post('/redact-docx', upload.single('file'), handleDocxRedaction);

module.exports = router;