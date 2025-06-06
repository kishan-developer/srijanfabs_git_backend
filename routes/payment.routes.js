const express = require("express");
const { checkoutHandler } = require("../controller/payment.controller");
const paymentRoutes = express.Router();
paymentRoutes.post("/checkout", checkoutHandler);
module.exports = paymentRoutes;
