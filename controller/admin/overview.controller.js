const Product = require("../../model/Product.model");
const Order = require("../../model/Order.model");
const Category = require("../../model/Category.model");
const Payment = require("../../model/Payment.model");
const User = require("../../model/User.model");

const getOverview = async (req, res) => {
    try {
        // Fetch low stock products (e.g., stock < 10)
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } });

        // Fetch total revenue from completed payments
        const totalRevenue = await Payment.aggregate([
            { $match: { status: "Success" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        // Fetch pending orders
        const pendingOrders = await Order.find({ deliveryStatus: "Pending" });

        // Fetch products for calculating the average rating
        const products = await Product.find({});
        const averageRating =
            products.reduce((sum, product) => {
                const ratings = product.reviews.length;
                return sum + (ratings > 0 ? product.rating : 0);
            }, 0) / products.length;

        // Fetch top-selling products (sorted by quantity sold)
        const topSellingProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalSales: { $sum: "$items.quantity" },
                },
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 }, // Top 5 selling products
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            { $project: { name: "$product.name", sales: "$totalSales" } },
        ]);

        // Fetch category stock (number of items in each category)
        const categoryStock = await Category.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "products",
                },
            },
            { $project: { name: 1, stock: { $sum: "$products.stock" } } },
        ]);

        // Fetch total number of products
        const totalProducts = await Product.countDocuments();

        // Fetch active users (users who have made a purchase in the last 30 days)
        const activeUsers = await User.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "user",
                    as: "userOrders",
                },
            },
            {
                $match: {
                    "userOrders.date": {
                        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            },
        ]);

        // Fetch order status breakdown (e.g., Pending, Delivered, Canceled)
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: "$deliveryStatus",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Return the aggregated data to the client
        res.json({
            lowStockProducts,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            averageRating: averageRating.toFixed(1),
            topSellingProducts,
            categoryStock,
            totalProducts,
            activeUsers: activeUsers.length,
            orderStats,
        });
    } catch (err) {
        console.error("Error fetching overview data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getOverview,
};
