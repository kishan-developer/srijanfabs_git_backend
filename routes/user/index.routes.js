const express = require("express");
const { isAuthenticated } = require("../../middleware/auth.middleware");
const cartRouter = require("./cart.routes");
const userRoutes = express.Router();

userRoutes.use("/cart", isAuthenticated, cartRouter);
module.exports = userRoutes;
