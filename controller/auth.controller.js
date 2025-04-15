const asyncHandler = require("express-async-handler");
const User = require("../model/User.model");
const generateOtp = require("../utils/otpGenerator.utils");
const OTP = require("../model/Otp.model");

exports.sendOtp = asyncHandler(async (req, res) => {
    // get email
    const { email } = req.body;
    // check is Email Have Or Not if have then go forward or return errr;
    if (!email) {
        return res.error("Email is required", 401);
    }
    // check is user already exit or not if user already exit then return error otherwise go forward
    const isUserAlreadyExit = await User.findOne({ email });
    if (isUserAlreadyExit) {
        return res.error("User Already Exit", 401);
    }
    // genrate unique OTP
    let otp = await generateOtp();

    // Save OTP In Database With Email And Send Response SuccessFull..
    const otpPayload = { otp, email };
    const newOtp = await OTP.create(otpPayload);
    return res.success("Otp Generated Successfully", newOtp);
});

exports.registerUser = asyncHandler(async (req, res) => {});
exports.login = asyncHandler(async (req, res) => {});
