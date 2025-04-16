const asyncHandler = require("express-async-handler");
const User = require("../model/User.model");
const generateOtp = require("../utils/otpGenerator.utils");
const OTP = require("../model/Otp.model");
const bcrypt = require("bcryptjs");
const mailSender = require("../utils/mailSender.utils");
const registrationSuccessTemplate = require("../email/template/registrationSuccessTemplate");
const getSessionDetails = require("../utils/getSessionDetails");
const loginAlertTemplate = require("../email/template/loginAlertTemplate");
const getCurrentDateTime = require("../utils/getCurrentDateTime");

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
    // Delete All Otp Before Saving New Otp
    await OTP.deleteMany({ email });
    const newOtp = await OTP.create(otpPayload);
    return res.success("Otp Generated Successfully", newOtp);
});

// Controller function to handle user registration
exports.registerUser = asyncHandler(async (req, res) => {
    // Destructure fields from request body
    const { phone, password, confirmPassword, otp } = req.body;
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const firstName = req.body.firstName.trim().toLowerCase();
    const lastName = req.body.lastName.trim().toLowerCase();
    // 400 Bad Request – Missing required fields
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !confirmPassword ||
        !otp
    ) {
        return res.error("All fields are required.", 400);
    }

    // 400 Bad Request – Passwords don't match
    if (password !== confirmPassword) {
        return res.error("Password does not match.", 400);
    }
    // 409 Conflict – User already exists
    const isUserAlreadyExist = await User.findOne({ email });
    if (isUserAlreadyExist) {
        return res.error("User already exists.", 409);
    }
    // 404 Not Found – OTP record not found (expired or never generated)
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
        return res.error(
            "OTP record not found (expired or never generated)",
            404
        );
    }

    // 400 Bad Request – OTP provided does not match
    if (otpRecord.otp !== otp) {
        return res.error("OTP does not match.", 400);
    }

    // Prepare user data for DB
    const userPayload = {
        firstName,
        lastName,
        email,
        phone,
        password,
    };

    // Save new user
    const newUser = await User.create(userPayload);
    // Send registration success email
    await mailSender(
        newUser.email,
        "Welcome to Shreejan Fab – Your Registration is Complete!",
        registrationSuccessTemplate(`${newUser.firstName} ${newUser.lastName}`)
    );

    // 201 Created – Resource successfully created
    return res.success("User created successfully.", newUser);
});

exports.login = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const email = req.body?.email.trim().toLowerCase();

    // Check all Required Field Are Available Or Not.
    if (!email || !password) {
        return res.error("All Field Are Required.", 400);
    }
    // Check Is User Exit Or Not
    const user = await User.findOne({ email });
    if (!user) {
        return res.error("User Dose Not Exit!");
    }
    // Check Is User Password Are Same Or Not ?
    // ---> Compare User Password And  Input Password By bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return res.error("Password dose not match", 403);
    }
    // Generate Token For User
    const token = await user.generateToken();
    // send login alert to user
    const session = getSessionDetails(req);
    await mailSender(
        user.email,
        "Alert: A New Login Was Detected on Your Account",
        loginAlertTemplate(
            `${user.firstName} ${user.lastName}`,
            session.device,
            session.location,
            session.ip,
            getCurrentDateTime()
        )
    );
    // send success response
    res.success(`Welcome ${user.firstName}`, token);
});
