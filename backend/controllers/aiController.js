const axios = require('axios');

exports.GenerateTemplates = async (req, res) => {
    try {
        const { subject, audience, purpose, details } = req.body;

        if (!subject || !audience || !purpose || !details) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBrFMBy0ZuynmsxXH-9BiHoeqXBecABXlA"; // Use environment variable in production
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        // Prompt for Generate 1
        const prompt1 = `Generate 1 unique email templates in pure HTML with inline CSS for ${purpose}. 
            Subject: ${subject}. Audience: ${audience}. Details: ${details}. 
            Ensure they are fully formatted with inline styles, visually appealing, and include a header, body, call-to-action button, and footer with unsubscribe link. 
            Return only the HTML content without any additional text or markdown formatting like code blocks.`;

        const requestBody1 = {
            contents: [{
                parts: [{ text: prompt1 }]
            }]
        };

        // Prompt for Generate 2
        const prompt2 = `Generate 1 more unique email templates in pure HTML with inline CSS for ${purpose}. 
            Subject: ${subject}. Audience: ${audience}. Details: ${details}. 
            Ensure they are different from the first set, fully formatted with inline styles, visually appealing, and include a header, body, call-to-action button, and footer with unsubscribe link. 
            Return only the HTML content without any additional text or markdown formatting like code blocks.`;

        const requestBody2 = {
            contents: [{
                parts: [{ text: prompt2 }]
            }]
        };

        // Make two separate API calls
        const [response1, response2] = await Promise.all([
            axios.post(url, requestBody1, { headers: { "Content-Type": "application/json" } }),
            axios.post(url, requestBody2, { headers: { "Content-Type": "application/json" } })
        ]);

        // Function to clean markdown from HTML content
        const cleanHtml = (text) => {
            // Remove ```html and ``` markers and trim whitespace
            return text
                .replace(/```html\s*\n?/g, '') // Remove opening markdown
                .replace(/```\s*\n?/g, '')     // Remove closing markdown
                .trim();
        };

        // Extract and clean templates from both responses
        const templates1 = response1.data.candidates.map(candidate => ({
            id: Math.random().toString(36).substr(2, 9),
            subject: subject,
            content: cleanHtml(candidate.content.parts[0].text)
        }));
        const templates2 = response2.data.candidates.map(candidate => ({
            id: Math.random().toString(36).substr(2, 9),
            subject: subject,
            content: cleanHtml(candidate.content.parts[0].text)
        }));

        // Combine all templates
        const allTemplates = [...templates1, ...templates2];

        res.status(200).json({
            templates: allTemplates
        });

    } catch (error) {
        console.error('Error generating templates:', error.message);
        res.status(500).json({
            message: "Failed to Generate Templates",
            error: error.message
        });
    }
};


const nodemailer = require('nodemailer');
const EventEmitter = require('events');

class EmailEvent extends EventEmitter {}
const emailEvent = new EmailEvent();


// Simple email validation regex
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.SendEmails = async (req, res) => {
    try {
        const { recipients, subject, content, emailConfigs } = req.body;

        if (!recipients || !subject || !content || !emailConfigs || !Array.isArray(emailConfigs) || emailConfigs.length === 0) {
            return res.status(400).json({ message: "Missing or invalid required fields" });
        }

        // Validate and clean emailConfigs
        const cleanedEmailConfigs = emailConfigs.map(config => ({
            senderEmail: config.senderEmail,
            appPassword: config.appPassword ? config.appPassword.replace(/\s/g, '') : ''
        }));

        for (const config of cleanedEmailConfigs) {
            if (!config.senderEmail || !isValidEmail(config.senderEmail) || !config.appPassword) {
                return res.status(400).json({ message: "Each email config must have a valid senderEmail and appPassword" });
            }
        }

        // Validate recipients
        const validRecipients = [];
        const invalidRecipients = [];
        recipients.forEach(recipient => {
            if (isValidEmail(recipient)) {
                validRecipients.push(recipient);
            } else {
                invalidRecipients.push(recipient);
            }
        });

        if (validRecipients.length === 0) {
            return res.status(400).json({ message: "No valid recipient emails provided" });
        }

        // Create transporters for each email config
        const transporters = cleanedEmailConfigs.map(config => ({
            transporter: nodemailer.createTransport({
                service: 'gmail',
                auth: { user: config.senderEmail, pass: config.appPassword }
            }),
            senderEmail: config.senderEmail
        }));

        let sentCount = 0;
        let failedCount = invalidRecipients.length; // Start with invalid recipients as failed
        const total = recipients.length;

        // Verify each transporter before sending
        const verifiedTransporters = [];
        for (const transporterObj of transporters) {
            try {
                await transporterObj.transporter.verify();
                verifiedTransporters.push(transporterObj);
            } catch (error) {
                console.error(`Failed to verify transporter for ${transporterObj.senderEmail}:`, error.message);
                failedCount += Math.ceil(validRecipients.length / transporters.length); // Approximate failed emails per invalid transporter
                emailEvent.emit('progress', { sent: sentCount, failed: failedCount, total });
            }
        }

        if (verifiedTransporters.length === 0) {
            return res.status(400).json({ message: "No valid email configurations available" });
        }

        // Distribute valid recipients across verified transporters (round-robin)
        const sendEmailPromises = validRecipients.map((recipient, index) => {
            const transporterObj = verifiedTransporters[index % verifiedTransporters.length];
            return transporterObj.transporter.sendMail({
                from: `"Your Company" <${transporterObj.senderEmail}>`,
                to: recipient,
                subject: subject,
                html: content
            })
            .then(() => {
                sentCount++;
                emailEvent.emit('progress', { sent: sentCount, failed: failedCount, total });
            })
            .catch((error) => {
                console.error(`Failed to send to ${recipient} from ${transporterObj.senderEmail}:`, error.message);
                failedCount++;
                emailEvent.emit('progress', { sent: sentCount, failed: failedCount, total });
            });
        });

        // Send response immediately to indicate process has started
        res.status(200).json({ 
            message: "Email sending started", 
            total, 
            initialFailed: invalidRecipients.length // Report initial failed count due to invalid emails
        });

        // Wait for all emails to be processed
        await Promise.all(sendEmailPromises);

        // Final update
        console.log(`Final: Sent: ${sentCount}, Failed: ${failedCount}, Total: ${total}`);
        emailEvent.emit('complete', { sent: sentCount, failed: failedCount, total });

    } catch (error) {
        console.error('Error in SendEmails:', error.message);
        res.status(500).json({ message: "Email sending failed", error: error.message });
    }
};

// Event Listener to log progress
emailEvent.on('progress', (data) => {
    console.log(`Progress - Sent: ${data.sent}, Failed: ${data.failed}, Remaining: ${data.total - data.sent - data.failed}, Total: ${data.total}`);
});

emailEvent.on('complete', (data) => {
    console.log(`Completed - Sent: ${data.sent}, Failed: ${data.failed}, Total: ${data.total}`);
});