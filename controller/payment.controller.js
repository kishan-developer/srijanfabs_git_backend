const razorpayInstance = require("../utils/razorpayInstance");

const Payment = require("./../model/Payment.model");
const crypto = require("crypto");
const Order = require("../model/Order.model");

exports.checkoutHandler = async (req, res) => {
    try {
        // console.log("razorpayInstance typeof", typeof razorpayInstance);
        // console.log("razorpayInstance.orders", razorpayInstance.orders);
        // console.log("razorpayInstance", razorpayInstance);

        // console.log("req.body", req.body);
        // take everything from razorpay
        const { amount, userId, items, addressId, paymentMethod } = req.body;

        if (!amount || !userId || !items || !addressId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

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
        console.error(" Checkout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the order",
            error: error.message,
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
            // Invalid signature — possible fraud
            return res.redirect(
                `${process.env.FRONTEND_URL}/paymentFailed?reason=Invalid signature`
            );
        }
    } catch (error) {
        console.error("Error in payment verification:", error);

        return res.redirect(
            `${process.env.FRONTEND_URL
            }/paymentFailed?reason=${encodeURIComponent(error.message)}`
        );
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        // Validate
        if (!["Pending", "Paid", "Failed"].includes(paymentStatus)) {
            return res.status(400).json({ message: "Invalid payment status" });
        }


        // Find order
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update fields
        order.paymentStatus = paymentStatus;
        if (paymentStatus === "Paid") {
            order.paidAt = new Date();
        } else {
            // clear paidAt when marking Pending/Failed
            order.paidAt = null;
        }

        // Save & return
        const updated = await order.save();
        return res.status(200).json({
            message: "Payment status updated",
            data: updated,
        });
    } catch (err) {
        console.error("Error updating payment status:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
