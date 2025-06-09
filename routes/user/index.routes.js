const express = require("express");
const { isAuthenticated } = require("../../middleware/auth.middleware");
const cartRouter = require("./cart.routes");
const wishlistRouter = require("./wishlist.routes");
const { orderRouter } = require("./order.routes");
const userRoutes = express.Router();

userRoutes.use("/cart", isAuthenticated, cartRouter);
userRoutes.use("/wishlist", isAuthenticated, wishlistRouter);
userRoutes.use("/orders", isAuthenticated, orderRouter);
module.exports = userRoutes;
