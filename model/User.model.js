const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        name: {
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

userSchema.pre("save", async (next) => {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async (enteredPassword) =>
    await bcrypt.compare(enteredPassword, this.password);

userSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id, isAdmin: this.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};
const User = mongoose.model("User", userSchema);

module.exports = User;
