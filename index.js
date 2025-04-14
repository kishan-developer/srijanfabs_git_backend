// app.js
const express = require("express");
const cors = require("cors");
const ratelimit = require("./middleware/rateLimit.middleware");
const notFound = require("./middleware/notFound.middleware");
const sendCustomResponse = require("./middleware/customResponse.middleware");
require("dotenv").config();

const app = express();

// Middleware to parse JSON body
app.use(express.json());
app.use(cors());
app.use(ratelimit);
app.use(sendCustomResponse);
// Simple test route
app.get("/", (req, res) => {
    return res.success("Welcome! Test route is working");
});

app.use(notFound);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
