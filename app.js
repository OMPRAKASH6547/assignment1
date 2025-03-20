const express = require('express');
const imageRoutes = require('./routes/imageRoutes');
const app = express();
const connect = require('./config/db')
require('dotenv').config();
connect()

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/images', imageRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
