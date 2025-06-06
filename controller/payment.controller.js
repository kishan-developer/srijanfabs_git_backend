const { razorpayInstance } = require("../config/razorpay");
const Payment = require("./../model/Payment.model");
const crypto = require("crypto");
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
// exports.paymentVerificationHandler = async (req, res) => {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
//         req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     try {
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
//             .update(body.toString())
//             .digest("hex");

//         const isAuthentic = razorpay_signature === expectedSignature;
//         if (isAuthentic) {
//             await Payment.create({
//                 razorpay_payment_id,
//                 razorpay_order_id,
//                 razorpay_signature,
//             });

//             return res.redirect(
//                 `${process.env.FRONTEND_URL}/paymentSucess?reference=${razorpay_payment_id}`
//             );
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

exports.paymentVerificationHandler = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    try {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = razorpay_signature === expectedSignature;

        if (isAuthentic) {
            // Save to DB
            await Payment.create({
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
            });

            // Redirect to success page
            return res.redirect(
                `${process.env.FRONTEND_URL}paymentSuccess?reference=${razorpay_payment_id}`
            );
        } else {
            //  Signature mismatch — possible fraud
            return res.redirect(
                `${process.env.FRONTEND_URL}paymentFailed?reason=Invalid signature`
            );
        }
    } catch (error) {
        console.error("Error in payment verification:", error);

        return res.redirect(
            `${
                process.env.FRONTEND_URL
            }paymentFailed?reason=${encodeURIComponent(error.message)}`
        );
    }
};
