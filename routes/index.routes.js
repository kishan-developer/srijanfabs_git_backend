const express = require("express");
const authRoutes = require("../routes/auth.routes");
const adminRoutes = require("../routes/admin/index.routes");
const {
    getAllProducts,
    getProductById,
    getProductByfabric,
} = require("../controller/public/product/product.controller");
const {
    getAllCategories,
    getCategoryById,
} = require("../controller/public/product/category.controller");


const imageUploader = require("../utils/imageUpload.utils");

const userRoutes = require("./user/index.routes");
const paymentRoutes = require("./payment.routes");
const mailSender = require("../utils/mailSender.utils");
const bookVideoCallTemplate = require("../email/template/bookVideoCallTemplate");
const bookVideoCallAdminTemplate = require("../email/template/bookVideoCallAdminTemplate");
const Newsletter = require("../model/Newsletter.model");
const contactEmailTemplate = require("../email/template/contactEmailTemplate");
const { getOffer } = require("../controller/public/product/offer.controller");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/payment", paymentRoutes);
// Public routes
// Products
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.get("/products/:fabric/:id", getProductByfabric);
// Categories
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.get("/offer", getOffer);

router.post("/upload", async (req, res) => {
    try {
        const images = req.files?.files ?? null;
        const imageFileName = req.body.name;

        if (!images) {
            return res
                .status(400)
                .json({ success: false, message: "Please upload file first" });
        }

        const imageList = Array.isArray(images) ? images : [images];

        for (const image of imageList) {
            if (image.size > 100 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "Image should not be larger than 100MB",
                });
            }
        }
        
        const slugFIleName = imageFileName.trim().replace(/\s+/g, "-");
        const result = await imageUploader(images, slugFIleName); // now uploads to local folder
        return res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            data: result,
        });
    } catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
});

// delete image from s3

router.post("/delete-image", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res
                .status(400)
                .json({ success: false, message: "Image URL is required" });
        }

        // Extract the object key from the URL
        const bucketBaseUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (!url.startsWith(bucketBaseUrl)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid S3 URL" });
        }

        const key = url.replace(bucketBaseUrl, ""); // get the S3 key

        await deleteFromS3(key);

        res.status(200).json({
            success: true,
            message: "Image deleted successfully",
            data: { key },
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete image",
            error: error.message,
        });
    }
});

router.post("/bookVideoCall", async (req, res) => {
    const { email, body } = req.body;

    if (!body) {
        // Use res.status() and res.json() for error responses
        return res.status(400).json({
            success: false,
            message: "All fields are required.",
        });
    }

    try {
        const usertemplate = bookVideoCallTemplate(
            body?.fullName,
            body?.date,
            body?.time
        );
        const admintemplate = bookVideoCallAdminTemplate(
            body?.fullName,
            body?.email,
            body?.phone,
            body?.date,
            body?.time,
            "None"
        );

        // Renamed 'res' variable to avoid conflict with the Express 'res' object
        const userMailResponse = await mailSender(
            email,
            "Video Call Book, Confirmation",
            usertemplate
        ); // send to user

        const adminMailResponse = await mailSender(
            "srijanfabs@gmail.com",
            "New Video Call Book",
            admintemplate
        ); // send to Admin

        // Use res.status() and res.json() for success responses
        return res.status(200).json({
            success: true,
            message: "Video Call Booked Successfully",
            data: { userMailResponse, adminMailResponse },
        });
    } catch (error) {
        console.log(error);
        // Use res.status() and res.json() for error responses
        return res.status(500).json({
            success: false,
            message: "Failed to book video call",
        });
    }
});

router.post("/newsletter", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.error("Please enter a valid email address", 400);
    }

    try {
        const exists = await Newsletter.findOne({ email });

        if (exists) {
            return res.error(
                "You are already subscribed to the newsletter.",
                409
            );
        }

        await Newsletter.create({ email });

        return res.success("Successfully subscribed to the newsletter!");
    } catch (err) {
        console.error("Newsletter Error:", err);
        return res.error("Something went wrong. Please try again later.", 500);
    }
});

// POST /api/contact
router.post("/contact", async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const htmlBody = contactEmailTemplate({
            name,
            email,
            phone,
            subject,
            message,
        });

        // Send mail to admin
        await mailSender(
            "srijanfabs@gmail.com",
            `Contact Us: ${subject}`,
            htmlBody
        );

        //  send a confirmation to user
        const userBody = `
      Hi ${name},<br/><br/>
      Thanks for reaching out! We've received your message and will get back to you shortly.<br/><br/>
      Regards,<br/>Srijan Fabs Team
    `;
        await mailSender(email, "We received your message!", userBody);

        return res.json({
            success: true,
            message: "Message sent successfully.",
        });
    } catch (err) {
        console.error("Contact POST error:", err);
        return res.status(500).json({ error: "Failed to send message." });
    }
});

module.exports = router;
