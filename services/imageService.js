const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Image = require('../models/imageModel');

const processImages = (requestId, products) => {
    products.forEach(async (product) => {
        for (const url of product.inputImageUrls) {
            try {
                const imageBuffer = await axios.get(url, { responseType: 'arraybuffer' });
                const outputFilePath = path.join(__dirname, 'uploads', `${Date.now()}-compressed.jpg`);

                await sharp(imageBuffer.data)
                    .resize({ width: 1000 })  // Example resizing
                    .jpeg({ quality: 50 })  // Compress by 50% quality
                    .toFile(outputFilePath);

                const processedImageUrl = `https://yourserver.com/uploads/${path.basename(outputFilePath)}`;

                // Save processed image info to the DB
                await Image.updateOne(
                    { requestId },
                    {
                        $push: {
                            processedImages: { url: processedImageUrl, status: 'processed' }
                        }
                    }
                );
            } catch (error) {
                await Image.updateOne(
                    { requestId },
                    {
                        $push: {
                            processedImages: { url: url, status: 'failed', error: error.message }
                        }
                    }
                );
            }
        }

        // Update status to completed
        await Image.updateOne({ requestId }, { status: 'completed' });

        // Optionally, trigger webhook
        const imageData = await Image.findOne({ requestId });
        if (imageData?.webhookUrl) {
            axios.post(imageData.webhookUrl, { message: 'Processing complete', requestId });
        }
    });
};

module.exports = { processImages };
