const { razorpayInstance } = require("../config/razorpay");

exports.checkoutHandler = async (req, res) => {
    try {
        const option = {
            amount: Number(req.body?.amount * 100),
            currency: "INR",
        };
        const order = await razorpayInstance.orders.create(option);
        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
