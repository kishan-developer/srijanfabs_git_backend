const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        razorpay_order_id: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                quantity: { type: Number, default: 1 },
            },
        ],
        shippingAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        deliveryStatus: {
            type: String,
            enum: [
                "Pending",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Canceled",
            ],
            default: "Pending",
        },
        totalAmount: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
