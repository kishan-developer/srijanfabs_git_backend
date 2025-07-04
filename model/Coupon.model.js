const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        minCartValue: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: null, // only for percentage type
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        usageLimitGlobal: {
            type: Number,
            default: 0, // 0 means unlimited
        },
        usageLimitPerUser: {
            type: Number,
            default: 1,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        firstTimeOnly: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
