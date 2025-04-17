const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    expireAt: {
        type: Date,
    },
});
