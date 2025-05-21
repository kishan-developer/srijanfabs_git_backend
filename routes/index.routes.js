const express = require("express");
const authRoutes = require("../routes/auth.routes");
const adminRoutes = require("../routes/admin/index.routes");
const {
    getAllProducts,
    getProductById,
} = require("../controller/public/product/product.controller");
const {
    getAllCategories,
    getCategoryById,
} = require("../controller/public/product/category.controller");

const router = express.Router();
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
// Public routes
// Products
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
// Categories
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
module.exports = router;
