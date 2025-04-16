const express = require("express");

const {
    sendOtp,
    login,
    registerUser,
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/send-otp", sendOtp);

module.exports = router;
