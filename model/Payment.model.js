const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    method: String, // e.g., 'Credit Card', 'PayPal' ,'UPI'
    status: {
        type: String,
        enum: ["Success", "Failed", "Pending"],
        default: "Pending",
    },
    transactionId: String,
    paidAt: { type: Date },
});

module.exports = mongoose.model("Payment", paymentSchema);
