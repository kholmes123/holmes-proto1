//       /services/watermarking/routes/watermarkRoutes.js
// This file is part of the watermarking service and contains the route definitions for the watermarking API.
// It defines the endpoints for embedding watermarks and verifying them.
// It uses the Express framework to handle HTTP requests and responses.
//
// It imports the necessary modules and the controller for watermarking.
// It defines a POST route for embedding watermarks and exports the router for use in the main application.

const express = require('express');
const router = express.Router();
const { generateWatermark } = require('../controllers/watermarkController');

router.post('/embedWatermark', generateWatermark);

module.exports = router;