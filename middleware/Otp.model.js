const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
});

// TODO :-> Create A Function For Send Email Before
const OTP = mongoose.model("OTP", otpSchema);
module.exports = module.exports = OTP;
