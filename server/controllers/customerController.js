const User = require("../models/User");
const Order = require("../models/Order");

const getAdminCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      role: "customer",
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const stats = await Order.aggregate([
          {
            $match: {
              user: customer._id,
              status: { $ne: "cancelled" },
            },
          },
          {
            $group: {
              _id: "$user",
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: "$total" },
            },
          },
        ]);

        return {
          ...customer,
          totalOrders: stats[0]?.totalOrders || 0,
          totalSpent: stats[0]?.totalSpent || 0,
        };
      })
    );

    res.json({
      success: true,
      count: customersWithStats.length,
      customers: customersWithStats,
    });
  } catch (error) {
    console.error("Get admin customers error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get customers",
    });
  }
};

module.exports = {
  getAdminCustomers,
};