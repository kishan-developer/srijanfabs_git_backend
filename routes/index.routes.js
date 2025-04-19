const express = require("express");
const authRoutes = require("../routes/auth.routes");
const adminRoutes = require("../routes/admin/index.routes");
const router = express.Router();
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
module.exports = router;
