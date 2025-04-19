const express = require("express");
const adminRouter = express.Router();
const productRoutes = require("../../routes/admin/product.routes");
const categoryRoutes = require("../../routes/admin/category.routes");
const {
    isAuthenticated,
    isAdmin,
} = require("../../middleware/auth.middleware");
adminRouter.use(isAuthenticated, isAdmin);
adminRouter.use("/product", productRoutes);
adminRouter.use("/category", categoryRoutes);

module.exports = adminRouter;
