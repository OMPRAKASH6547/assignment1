const express = require('express');
const mongoose = require('mongoose');
const imageRoutes = require('./routes/imageRoutes');
const app = express();

// Database connection
mongoose.connect('mongodb://localhost:27017/image-processing')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Middleware to parse JSON and form-data
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/images', imageRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
