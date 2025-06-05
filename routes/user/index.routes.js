const express = require("express");
const { isAuthenticated } = require("../../middleware/auth.middleware");
const cartRouter = require("./cart.routes");
const wishlistRouter = require("./wishlist.routes");
const userRoutes = express.Router();

userRoutes.use("/cart", isAuthenticated, cartRouter);
userRoutes.use("/wishlist", isAuthenticated, wishlistRouter);
module.exports = userRoutes;
