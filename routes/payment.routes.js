const express = require("express");
const {
    checkoutHandler,
    paymentVerificationHandler,
} = require("../controller/payment.controller");
const paymentRoutes = express.Router();
paymentRoutes.post("/checkout", checkoutHandler);
paymentRoutes.post("/verify-payment", paymentVerificationHandler);
paymentRoutes.get("/get-razorpay-key", (req, res) => {
    res.status(200).json({
        key: process.env.RAZORPAY_ID,
    });
});
module.exports = paymentRoutes;
