const express = require('express');
const router = express.Router();
const { retrieveWatermark } = require('../controllers/retrieveWatermarkController');

router.post('/retrieve', retrieveWatermark);

module.exports = router;