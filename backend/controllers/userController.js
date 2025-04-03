const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.GoogleAuth = async (req, res) => {
    try {
        const { email, name, picture, googleId } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user already exists
        let user = await User.findOne({ googleId });

        if (!user) {
            // Create a new user
            user = new User({ email, name, picture, googleId });
            await user.save();
        }

        // Generate JWT Token
        const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: 'User authenticated', user, token: authToken });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};