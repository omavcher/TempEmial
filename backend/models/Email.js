const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    lastUsed: { type: Date, default: null },
    useCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Email", emailSchema);
