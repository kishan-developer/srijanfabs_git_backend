const Product = require("../../../model/Product.model");

const asyncHandler = require("express-async-handler");
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate("category").exec();
    return res.success("Products Fetched Successfully.", products);
});

const getProductById = asyncHandler(async (req, res) => {
    const _id = req.body?.id || req.params.id;
    if (!_id) {
        return res.error("Products Id Are Required", 400);
    }
    const product = await Product.findById(_id);
    if (!product) {
        return res.error("Product Not Found", 404);
    }
    return res.success("Product Fetched Successfully", product);
});
module.exports = { getAllProducts, getProductById };
