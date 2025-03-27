const express = require('express');
const imageRoutes = require('./routes/imageRoutes');
const app = express();
const connect = require('./config/db')
const authRoutes = require("./routes/authRoutes");
require('dotenv').config();
connect()

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/images', imageRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
