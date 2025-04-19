const express = require("express");

const fileUplaod = require("express-fileupload");
const cors = require("cors");
const helmet = require("helmet");

const ratelimit = require("./middleware/rateLimit.middleware");
const notFound = require("./middleware/notFound.middleware");
const sendCustomResponse = require("./middleware/customResponse.middleware");
const connectDB = require("./config/connectDb");
require("dotenv").config();
const {
    globalErrorHandler,
} = require("./middleware/globalErrorHandler.middleware");
const connectCloudinary = require("./config/cloudinary");
const imageUploader = require("./utils/imageUpload.utils");
const router = require("./routes/index.routes");
// Connect Database
connectDB(); // connect Database
connectCloudinary(); // connect cloudinary
const app = express();

app.use(express.json());
app.use(cors());
// Limit repeated requests (rate limiting)
app.use(ratelimit);
// Secure HTTP headers to protect your app
app.use(helmet());
// Sanitize input to prevent NoSQL injection attacks

// Handle file uploads, with temporary storage for large files
app.use(
    fileUplaod({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
); //
app.use(sendCustomResponse);
// Routes For Login,Register,Send-Otp,Forgott-Password, Reset Password
app.use("/api/v1", router);

app.get("/", (req, res) => {
    return res.success("Welcome! Test route is working");
});

app.post("/upload", async (req, res) => {
    const images = req.files?.file ?? null;
    if (!images) {
        return res.error("Please Upload File First", 400);
    }
    if (Array.isArray(images)) {
        for (const image of images) {
            if (image.size > 10 * 1024 * 1024) {
                return res.error("Image should not be larger than 10MB", 400);
            }
        }
    }
    const result = await imageUploader(images);
    return res.success("Images Uploaded Successfully", result);
});

app.use(notFound);
app.use(globalErrorHandler);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
