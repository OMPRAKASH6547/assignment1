const Image = require('../models/imageModel');
const { processImages } = require('../services/imageService');
const uuid = require('uuid');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path')

// Middleware to handle CSV file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage }).single('csvFile');

// Upload API: Accepts the CSV, validates, and returns request ID
const uploadCSV = (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).send({ message: 'Error in file upload' });

        const csvFilePath = req.file.path;
        const products = [];

        // Read CSV file and parse data
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
                const { 'Product Name': productName, 'Input Image Urls': inputImageUrls } = row;
                products.push({ productName, inputImageUrls: inputImageUrls.split(',') });
            })
            .on('end', () => {
                // Create an entry in the database for this request
                const requestId = uuid.v4();
                const newImageEntry = new Image({
                    productName: products[0]?.productName, // assuming all have same product name
                    inputImageUrls: products.flatMap((p) => p.inputImageUrls),
                    requestId,
                    status: 'pending'
                });

                newImageEntry.save()
                    .then(() => {
                        // Process images asynchronously
                        processImages(requestId, products);
                        res.status(200).json({ requestId });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: 'Error saving to database', error: err.message });
                    });
            });
    });
};

// Status API: Query processing status with request ID
const getProcessingStatus = (req, res) => {
    const { requestId } = req.params;

    Image.findOne({ requestId })
        .then((imageData) => {
            if (!imageData) {
                return res.status(404).json({ message: 'Request not found' });
            }
            res.status(200).json({ status: imageData.status });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error fetching status', error: err.message });
        });
};
module.exports = {
    getProcessingStatus,
    uploadCSV

}
