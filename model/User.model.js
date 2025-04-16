const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            lowercase: true,
        },
        lastName: {
            type: String,
            required: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [
                /^[1-9][0-9]{9}$/,
                "Please enter a valid 10-digit phone number that does not start with 0",
            ],
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        shippingAddress: [
            {
                address: { type: String, required: true },
                city: { type: String, required: true },
                postalCode: { type: String, required: true },
                country: { type: String, required: true },
            },
        ],
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            isAdmin: this.isAdmin,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );
};
const User = mongoose.model("User", userSchema);

module.exports = User;
