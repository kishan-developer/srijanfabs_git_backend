// get cart
// add to cart
// remove from cart
// merge Cart

const express = require("express");
const cartRouter = express.Router();
const User = require("../../../model/User.model");

// ------------------------
// 1. GET CART
// ------------------------
cartRouter.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const cart = user?.cart?.[0] || { items: [], totalPrice: 0 };
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({
            message: "Failed to get cart",
            error: err.message,
        });
    }
});

// ------------------------
// 2. ADD TO CART
// ------------------------
cartRouter.post("/add", async (req, res) => {
    const { userId, productId, quantity, finalPrice, withCustomization } =
        req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        let cart = user.cart[0] || { items: [], totalPrice: 0 };
        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                item.withCustomization === withCustomization
        );

        const totalPrice = finalPrice * quantity;

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice += totalPrice;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                finalPrice,
                withCustomization,
                totalPrice,
            });
        }

        cart.totalPrice = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
        user.cart[0] = cart;
        await user.save();

        res.status(200).json({ message: "Added to cart", cart });
    } catch (err) {
        res.status(500).json({
            message: "Failed to add to cart",
            error: err.message,
        });
    }
});

// ------------------------
// 3. REMOVE FROM CART
// ------------------------
cartRouter.delete("/remove/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user || !user.cart[0])
            return res.status(404).json({ message: "Cart not found" });

        let cart = user.cart[0];

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );
        cart.totalPrice = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);

        await user.save();
        res.status(200).json({ message: "Removed from cart", cart });
    } catch (err) {
        res.status(500).json({
            message: "Failed to remove from cart",
            error: err.message,
        });
    }
});

// ------------------------
// 4. MERGE CART
// ------------------------
// Accept localCart: { items: [...] }
cartRouter.post("/merge", async (req, res) => {
    const { userId, localCart } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let cart = user.cart[0] || { items: [], totalPrice: 0 };

        for (let localItem of localCart.items) {
            const existing = cart.items.find(
                (item) =>
                    item.product.toString() === localItem.product &&
                    item.withCustomization === localItem.withCustomization
            );

            if (existing) {
                existing.quantity += localItem.quantity;
                existing.totalPrice += localItem.totalPrice;
            } else {
                cart.items.push(localItem);
            }
        }

        cart.totalPrice = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
        user.cart[0] = cart;
        await user.save();

        res.status(200).json({ message: "Cart merged", cart });
    } catch (err) {
        res.status(500).json({
            message: "Failed to merge cart",
            error: err.message,
        });
    }
});

module.exports = cartRouter;
