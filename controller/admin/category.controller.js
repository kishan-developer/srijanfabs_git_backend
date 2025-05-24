const asyncHandler = require("express-async-handler");
const Category = require("../../model/Category.model");
const sanitizePayload = require("../../utils/sanitizePayload");
const { CATEGORY_ALLOWED_FIELDS } = require("../../constants/constants");
const createCategory = asyncHandler(async (req, res) => {
    // get data from body;
    const { name, description } = req.body;

    // Validate data;
    if (!name || !description) return res.error("All fields are required", 400);
    // create New Category;
    const newCategory = await Category.create({ name, description });
    const allUpdatedCategories = await Category.find({});
    return res.success("Category Created Successfully", allUpdatedCategories);
});

const updateCategory = asyncHandler(async (req, res) => {
    const _id = req.params?.id || req.body?.id;
    if (Object.keys(req.body).length === 0) {
        return res.error("Please provide at least one field to update", 400);
    }

    const sanitizedPayload = sanitizePayload(req.body, CATEGORY_ALLOWED_FIELDS);
    if (Object.keys(sanitizedPayload).length == 0) {
        return res.error("Your input values are either invalid or empty.", 404);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        _id,
        sanitizedPayload,
        {
            new: true,
            runValidators: true,
        }
    );
    if (!updatedCategory) {
        return res.error("Category not found or update failed.", 404);
    }
    const allUpdatedCategories = await Category.find({});
    return res.success("Category Updated Successfully", allUpdatedCategories);
});
const deleteCategory = asyncHandler(async (req, res) => {
    const _id = req.params?.id || req.body?.id;
    if (!_id) {
        return res.error("category id is required", 404);
    }

    const categoryDetails = await Category.findByIdAndDelete(_id);
    if (!categoryDetails) {
        return res.error("Category Not Found", 404);
    }
    return res.success("Category Deleted Successfully");
});

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
};
