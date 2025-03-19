const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const uuidv4 = require("uuid").v4;
const ImageProcessing = require("../models/ImageProcessing");

// Process images and update status in DB
async function processImages(requestId) {
    const processingData = await ImageProcessing.findOne({ requestId });

    if (!processingData) {
        throw new Error("Request not found");
    }

    // Update status to processing
    await ImageProcessing.updateOne({ requestId }, { $set: { status: "processing" } });

    for (const product of processingData.products) {
        for (const imageUrl of product.imageUrls) {
            try {
                const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
                const imageBuffer = Buffer.from(response.data);
                const outputImagePath = path.join(__dirname, "../processed_images", `${uuidv4()}.jpg`);

                // Compress the image by 50%
                await sharp(imageBuffer).jpeg({ quality: 50 }).toFile(outputImagePath);

                // Update DB with output URL
                await ImageProcessing.updateOne(
                    { requestId, "products.productName": product.productName, "products.imageUrls": imageUrl },
                    { $set: { "products.$.status": "processed", "products.$.outputUrl": outputImagePath } }
                );
            } catch (error) {
                console.error(`Error processing image ${imageUrl}: ${error.message}`);
                await ImageProcessing.updateOne(
                    { requestId, "products.productName": product.productName, "products.imageUrls": imageUrl },
                    { $set: { "products.$.status": "failed" } }
                );
            }
        }
    }

    // Once all images are processed, set the status to completed
    await ImageProcessing.updateOne({ requestId }, { $set: { status: "completed" } });
}

module.exports = {
    processImages
};
