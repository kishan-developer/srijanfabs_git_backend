const { razorpayInstance } = require("../config/razorpay");
const Payment = require("./../model/Payment.model");
const crypto = require("crypto");
const Order = require("../model/Order.model");

exports.checkoutHandler = async (req, res) => {
    try {
        const { amount, userId, items, addressId, paymentMethod } = req.body;

        // 1. Create Razorpay order
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amount * 100,
            currency: "INR",
        });

        // 2. Save order in MongoDB
        const order = await Order.create({
            razorpay_order_id: razorpayOrder.id,
            user: userId,
            items,
            shippingAddress: addressId,
            paymentMethod,
            totalAmount: amount,
        });

        return res.status(200).json({
            success: true,
            razorpayOrder,
            orderId: order._id,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.paymentVerificationHandler = async (req, res) => {
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    try {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = razorpay_signature === expectedSignature;

        if (isAuthentic) {
            // 1. Find the related order
            const order = await Order.findOne({ razorpay_order_id });

            if (!order) {
                return res.redirect(
                    `${process.env.FRONTEND_URL}/paymentFailed?reason=Order not found`
                );
            }

            // 2. Update order status
            order.paymentStatus = "Paid";
            order.paidAt = new Date();
            await order.save();

            // 3. Create Payment record
            await Payment.create({
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                user: userId,
                orderId: order._id,
            });

            // 4. Redirect to success
            return res.redirect(
                `${process.env.FRONTEND_URL}/paymentSuccess?reference=${razorpay_payment_id}`
            );
        } else {
            // ❌ Invalid signature — possible fraud
            return res.redirect(
                `${process.env.FRONTEND_URL}/paymentFailed?reason=Invalid signature`
            );
        }
    } catch (error) {
        console.error("Error in payment verification:", error);

        return res.redirect(
            `${
                process.env.FRONTEND_URL
            }/paymentFailed?reason=${encodeURIComponent(error.message)}`
        );
    }
};
