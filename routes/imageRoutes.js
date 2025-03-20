const express = require('express');
const { uploadCSV, getProcessingStatus } = require('../controllers/imageController');

const router = express.Router();

// Upload API
router.post('/upload', uploadCSV);

// Status API
router.get('/status/:requestId', getProcessingStatus);

module.exports = router;
