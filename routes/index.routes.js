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
const imageUploader = require("../utils/imageUpload.utils");

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
// Upload ->
router.post("/upload", async (req, res) => {
 
    const images = req.files?.files ?? null;
    if (!images) {
        return res.error("Please Upload File First", 400);
    }
    if (Array.isArray(images)) {
        for (const image of images) {
            if (image.size > 10 * 1024 * 1024) {
                return res.error("Image should not be larger than 10MB", 400);
            }
        }
    }
    const result = await imageUploader(images);
    return res.success("Images Uploaded Successfully", result);
});
module.exports = router;
