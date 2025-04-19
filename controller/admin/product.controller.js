const asyncHandler = require("express-async-handler");
const imageUplaoder = require("../../utils/imageUpload.utils");
const Product = require("../../model/Product.model");
const sanitizePayload = require("../../utils/sanitizePayload");
const { PRODUCT_ALLOWED_FIELDS } = require("../../constants/constants");

const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        category,
        stock,
        fabric,
        technique,
        color,
        weight,
        assurance,
        hsnCode,
        reviews,
        images,
    } = req.body;
    console.log(
        name,
        description,
        price,
        category,
        stock,
        fabric,
        technique,
        color,
        weight,
        assurance,
        hsnCode,
        reviews,
        images
    );
    // get product details from Body Check Is Everything  Was There Or Not ?
    if (
        !name ||
        !description ||
        !price ||
        !category ||
        !stock ||
        !fabric ||
        !technique ||
        !color ||
        !weight ||
        !assurance ||
        !hsnCode ||
        !reviews ||
        !images
    ) {
        return res.error("All fields are required.", 400);
    }

    const productPayload = {
        name,
        description,
        price,
        category,
        stock,
        fabric,
        technique,
        color,
        weight,
        assurance,
        hsnCode,
        reviews,
        images,
    };
    // create new product
    const product = await Product.create(productPayload);
    return res.success("Product Created Successfully.", product);
});
const updateProduct = asyncHandler(async (req, res) => {
    // get product data
    const _id = req.params?.id || req.body?.id;
    let productPayload = req.body ?? null;
    if (!_id) {
        return res.error("Product Id is required", 400);
    }
    // Check Is Payload Is Not Empty
    if (!productPayload || Object.keys(productPayload).length == 0) {
        return res.error("Please provide fields to update", 400);
    }

    const sanitizedPayload = sanitizePayload(
        productPayload,
        PRODUCT_ALLOWED_FIELDS
    );
    if (Object.keys(sanitizedPayload).length == 0) {
        return res.error("All input values are either invalid or empty.", 404);
    }
    const updatedProduct = await Product.findByIdAndUpdate(
        _id,
        sanitizedPayload,
        {
            new: true,
            runValidators: true,
        }
    );
    if (!updatedProduct) {
        return res.error("Product not found or update failed.", 404);
    }
    return res.success("Product Updated Successfully", updatedProduct);
});
const getAllProducts = asyncHandler(async (req, res) => {});
const getProduct = asyncHandler(async (req, res) => {});
const deleteProduct = asyncHandler(async (req, res) => {});

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};
