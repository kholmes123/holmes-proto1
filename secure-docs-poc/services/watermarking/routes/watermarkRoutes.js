const express = require('express');
const router = express.Router();
const { generateWatermark } = require('../controllers/watermarkController');

router.post('/embed', generateWatermark);

module.exports = router;