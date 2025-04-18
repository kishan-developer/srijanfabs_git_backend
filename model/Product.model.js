const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        images: {
            type: [String], // This means the field is an array of strings
            required: true,
            validate: {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0; // Check For This should Not Be EMpty
                },
                message: "At least one image is required",
            },
        },

        fabric: {
            type: String,
            required: true,
        },
        technique: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        weight: {
            type: String,
            required: true,
        },
        assurance: {
            type: String,
            required: true,
        },
        hsnCode: {
            type: String,
            required: true,
        },
        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    }, // Store review IDs for each product
    { timestamps: true }
);
// Create Vertualt Key : Rating And calculate
productSchema.virtual("rating").get(function () {
    // Calculate the average rating from the reviews
});
module.exports = mongoose.model("Product", productSchema);
