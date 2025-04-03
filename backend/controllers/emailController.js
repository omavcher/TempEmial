const mongoose = require("mongoose");
const Email = require("../models/Email");



// New AdminEmailPut Controller
exports.adminEmailPut = async (req, res) => {
    try {
        const emailData = req.body; // Array of {email, token} objects
        
        if (!Array.isArray(emailData) || emailData.length === 0) {
            return res.status(400).json({
                message: "Request body must be a non-empty array of email/token objects"
            });
        }

        // Validate each entry
        for (const entry of emailData) {
            if (!entry.email || !entry.token) {
                return res.status(400).json({
                    message: "Each entry must contain both email and token"
                });
            }
        }

        // Save or update emails in database
        const results = await Promise.all(emailData.map(async (entry) => {
            const result = await Email.findOneAndUpdate(
                { email: entry.email },
                {
                    email: entry.email,
                    token: entry.token,
                    lastUsed: null,
                    useCount: 0
                },
                { upsert: true, new: true }
            );
            return result;
        }));

        res.status(200).json({
            message: "Emails successfully saved/updated",
            count: results.length,
            emails: results.map(r => ({ email: r.email, token: r.token }))
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to save emails",
            error: error.message
        });
    }
};

// Modified generateEmail to only use DB
exports.generateEmail = async (req, res) => {
    try {
        const randomEmail = await Email.aggregate([
            { $sample: { size: 1 } },
            { $project: { _id: 0, email: 1, token: 1 } }
        ]);

        if (randomEmail.length > 0) {
            res.status(200).json({
                email: randomEmail[0].email,
                source: 'database'
            });
        } else {
            res.status(404).json({
                message: 'No emails available in database'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve email',
            error: error.message
        });
    }
};

// Unchanged getUnusedEmail
exports.getUnusedEmail = async (req, res) => {
    try {
        let emailObj = await Email.findOne({ useCount: { $exists: false } })
            .sort({ createdAt: 1 });

        if (!emailObj) {
            emailObj = await Email.findOne({})
                .sort({ lastUsed: 1 });
        }

        if (!emailObj) {
            return res.status(404).json({ message: "No emails available" });
        }

        emailObj.lastUsed = new Date();
        emailObj.useCount = (emailObj.useCount || 0) + 1;
        await emailObj.save();
        
        return res.json({
            message: 'Email retrieved successfully',
            email: emailObj.email,
            token: emailObj.token
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching email", 
            error: error.message 
        });
    }
};

// Unchanged fetchMessages
exports.fetchMessages = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const emailObj = await Email.findOne({ email });
        if (!emailObj) {
            return res.status(404).json({ message: "Email not found" });
        }

        const response = await fetch("https://web2.temp-mail.org/messages", {
            method: 'GET',
            headers: { 
                "Authorization": emailObj.token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return res.json({
            data
        });
    } catch (error) {
        console.error('Fetch messages error:', error.message);
        res.status(500).json({ 
            message: "Error fetching messages", 
            error: error.message 
        });
    }
};
