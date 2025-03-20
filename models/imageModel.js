const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    inputImageUrls: [String],
    processedImages: [{ url: String, status: String, error: String }],
    requestId: { type: String, required: true },
    status: { type: String, default: 'pending' },
    webhookUrl: String,  // Webhook URL to notify after processing
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
