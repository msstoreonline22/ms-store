const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const DiscountCode = require("../models/DiscountCode");

const getOverview = async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      activeProducts,
      totalCustomers,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "delivered" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.revenue || 0;

    res.json({
      success: true,
      overview: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        activeProducts,
        totalCustomers,
      },
    });
  } catch (error) {
    console.error("Analytics overview error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics overview",
    });
  }
};

const getDetailedAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      revenueByDay,
      ordersByStatus,
      bestSellers,
      lowStockProducts,
      topDiscountCodes,
      revenueResult,
      orderCount,
      cancelledOrders,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            quantitySold: { $sum: "$items.quantity" },
            revenue: {
              $sum: {
                $multiply: ["$items.price", "$items.quantity"],
              },
            },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 8 },
      ]),

      Product.find({ stock: { $lte: 3 }, isActive: true })
        .sort({ stock: 1 })
        .select("name slug images stock price")
        .limit(8),

      DiscountCode.find()
        .sort({ usedCount: -1 })
        .select("code type value usedCount usageLimit isActive")
        .limit(8),

      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            averageOrderValue: { $avg: "$total" },
          },
        },
      ]),

      Order.countDocuments({ status: { $ne: "cancelled" } }),
      Order.countDocuments({ status: "cancelled" }),
    ]);

    const totalRevenue = revenueResult[0]?.revenue || 0;
    const averageOrderValue = revenueResult[0]?.averageOrderValue || 0;

    const formattedRevenueByDay = [];
    for (let index = 0; index < 7; index += 1) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + index);

      const key = date.toISOString().slice(0, 10);
      const foundDay = revenueByDay.find((day) => day._id === key);

      formattedRevenueByDay.push({
        date: key,
        revenue: foundDay?.revenue || 0,
        orders: foundDay?.orders || 0,
      });
    }

    res.json({
      success: true,
      analytics: {
        summary: {
          totalRevenue,
          averageOrderValue,
          completedOrderCount: orderCount,
          cancelledOrders,
        },
        revenueByDay: formattedRevenueByDay,
        ordersByStatus,
        bestSellers,
        lowStockProducts,
        topDiscountCodes,
      },
    });
  } catch (error) {
    console.error("Detailed analytics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load detailed analytics",
    });
  }
};

module.exports = {
  getOverview,
  getDetailedAnalytics,
};