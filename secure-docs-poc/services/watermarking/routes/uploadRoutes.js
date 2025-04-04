const express = require('express');
const multer = require('multer');
const path = require('path');
const { generateWatermark } = require('../controllers/watermarkController');

const router = express.Router();

// 🔸 Configure multer to save uploaded files to "test data" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../../test data'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `file-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// 🔸 Define route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Trigger the watermark generation using uploaded file
    await generateWatermark(
      {
        body: {
          originalFilename: uploadedFile.originalname,
          redactedFilePath: uploadedFile.path
        }
      },
      res
    );

  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ error: 'Failed to process uploaded file.' });
  }
});

module.exports = router;