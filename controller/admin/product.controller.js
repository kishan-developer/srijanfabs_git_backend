const asyncHandler = require("express-async-handler");
const imageUplaoder = require("../../utils/imageUpload.utils");
const Product = require("../../model/Product.model");
// Pending
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
    // Check Is There Is ANy Image Larger than 10mb if have then throw error

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
const getAllProducts = asyncHandler(async (req, res) => {});
const getProduct = asyncHandler(async (req, res) => {});
const updateProduct = asyncHandler(async (req, res) => {});
const deleteProduct = asyncHandler(async (req, res) => {});

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};
