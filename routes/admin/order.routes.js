const express = require("express");
const {
    getOrders,
    updateOrderStatus,
    getOrderById,
} = require("../../controller/admin/order.controller");

const orderRouter = express.Router();

// Get all orders
orderRouter.get("/all-orders", getOrders);

// Update order status
orderRouter.put("/order/:id/status", updateOrderStatus);
orderRouter.get("/order/:id", getOrderById);

module.exports = orderRouter;
