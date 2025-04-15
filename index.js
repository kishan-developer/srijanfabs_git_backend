const express = require("express");
const cors = require("cors");
const ratelimit = require("./middleware/rateLimit.middleware");
const notFound = require("./middleware/notFound.middleware");
const sendCustomResponse = require("./middleware/customResponse.middleware");
const connectDB = require("./config/connectDb");
require("dotenv").config();
const authRoutes = require("./routes/auth.routes");
const { globalErrorHandler } = require("./middleware/globalErrorHandler");
// Connect Database
connectDB();
const app = express();

app.use(express.json());
app.use(cors());
app.use(ratelimit);
app.use(sendCustomResponse);
app.use("/api/v1/auth", authRoutes);
// Simple test route
app.get("/", (req, res) => {
    return res.success("Welcome! Test route is working");
});

app.use(notFound);
app.use(globalErrorHandler);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
