const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');
const aiRoutes = require('./routes/aiRoutes');

const cors = require('cors');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is healthy 🚀' });
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ai', aiRoutes);


// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://omawchar07:omawchar07pass@cluster0.u68uwg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
