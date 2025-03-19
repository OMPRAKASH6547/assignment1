const express = require("express");
const multer = require("multer");
const { uploadCsv, checkStatus } = require("../controllers/imageController");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// Route to upload CSV file
router.post("/upload-csv", upload.single("csvFile"), uploadCsv);

// Route to check processing status
router.get("/check-status/:requestId", checkStatus);

module.exports = router;
