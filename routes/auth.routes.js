const express = require("express");

const {
    sendOtp,
    login,
    registerUser,
    changePassword,
    forgotPassword,
    forgotPasswordToken,
} = require("../controller/auth.controller");
const { isAuthenticated } = require("../middleware/auth.middleware");

const router = express.Router();
// {domain}/api/v1/auth/send-otp
router.post("/send-otp", sendOtp);
// {domain}/api/v1/auth/register
router.post("/register", registerUser);
// {domain}/api/v1/auth/login
router.post("/login", login);
// {domain}/api/v1/auth/forgot-password-token
router.post("/forgot-password-token", forgotPasswordToken);
// {domain}/api/v1/auth/change-password
router.put("/change-password", isAuthenticated, changePassword);
// {domain}/api/v1/auth/forgot-password/:token <- dynamic
router.put("/forgot-password/:token", forgotPassword);
module.exports = router;
