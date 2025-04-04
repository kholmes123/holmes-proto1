// services/api-gateway/routes/uploadRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleFileUpload } = require('../controllers/uploadController');

const router = express.Router();

// Set up Multer to store uploads temporarily in memory or a temp folder
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const uniqueName = `file-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /upload
router.post('/upload', upload.single('file'), handleFileUpload);

module.exports = router;
