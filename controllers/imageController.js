const { processImages } = require("../services/imageService");
const ImageProcessing = require("../models/ImageProcessing");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Upload CSV and start processing
async function uploadCsv(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: "CSV file is required" });
    }

    const requestId = uuidv4();
    const processingData = {
        requestId,
        status: "pending",
        products: []
    };

    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    // Read and parse the CSV
    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
            const imageUrls = row["Input Image Urls"].split(",").map(url => url.trim());
            processingData.products.push({ productName: row["Product Name"], imageUrls });
        })
        .on("end", async () => {
            try {
                // Save the processing data to the DB
                await new ImageProcessing(processingData).save();
                // Process the images asynchronously
                processImages(requestId);
                res.status(200).json({ requestId });
            } catch (error) {
                console.error("Error saving data: ", error);
                res.status(500).json({ error: "Failed to save data" });
            }
        });
}

// Check the status of image processing
async function checkStatus(req, res) {
    const { requestId } = req.params;
    const processingStatus = await ImageProcessing.findOne({ requestId });

    if (!processingStatus) {
        return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(processingStatus);
}

module.exports = {
    uploadCsv,
    checkStatus
};
