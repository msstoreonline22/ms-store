const Order = require("../models/Order");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const DiscountCode = require("../models/DiscountCode");
const Offer = require("../models/Offer");

const generateOrderNumber = require("../utils/generateOrderNumber");
const calculateOrderTotals = require("../utils/calculateOrderTotals");
const calculateDiscountCode = require("../utils/calculateDiscountCode");

const {
  sendNewOrderEmailToOwner,
  sendOrderConfirmationEmailToCustomer,
  sendOrderStatusUpdateEmailToCustomer,
} = require("../services/emailService");

const createOrder = async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      paymentMethod,
      deliveryZone,
      discountCode,
    } = req.body;

    if (!customerInfo || !items || !items.length || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required order data",
      });
    }

    const settings = await Settings.findOne();
    const deliveryFees = settings?.deliveryFees || {
      cairoGiza: 85,
      otherGovernorates: 150,
    };

    const deliveryFee =
      deliveryZone === "cairoGiza"
        ? deliveryFees.cairoGiza
        : deliveryFees.otherGovernorates;

    const activeOffer = await Offer.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `${item.name || "Product"} is no longer available`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} only has ${product.stock} left in stock`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || "",
        size: item.size,
        color: item.color,
        quantity: Number(item.quantity),
        price: product.price,
      });
    }

    const initialTotals = calculateOrderTotals(
      orderItems,
      deliveryFee,
      0,
      activeOffer
    );

    let appliedDiscountCode = {
      code: "",
      type: "",
      value: 0,
      amount: 0,
    };

    if (discountCode?.code) {
      const foundDiscountCode = await DiscountCode.findOne({
        code: String(discountCode.code).toUpperCase().trim(),
      });

      const discountResult = calculateDiscountCode(
        foundDiscountCode,
        initialTotals.subtotalAfterOffer
      );

      if (!discountResult.isValid) {
        return res.status(400).json({
          success: false,
          message: discountResult.message,
        });
      }

      appliedDiscountCode = {
        code: foundDiscountCode.code,
        type: foundDiscountCode.type,
        value: foundDiscountCode.value,
        amount: discountResult.discountAmount,
      };

      foundDiscountCode.usedCount += 1;
      await foundDiscountCode.save();
    }

    const totals = calculateOrderTotals(
      orderItems,
      deliveryFee,
      appliedDiscountCode.amount,
      activeOffer
    );

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: req.user?._id || null,
      customerInfo,
      items: orderItems,
      normalSubtotal: totals.normalSubtotal,
      discount: totals.discount,
      offerDiscount: totals.offerDiscount,
      discountCode: appliedDiscountCode,
      subtotalAfterOffer: totals.subtotalAfterOffer,
      subtotalAfterDiscountCode: totals.subtotalAfterDiscountCode,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      paymentMethod,
      status: "pending",
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    sendNewOrderEmailToOwner(order).catch((error) => {
      console.error("Owner order email failed:", error.message);
    });

    sendOrderConfirmationEmailToCustomer(order).catch((error) => {
      console.error("Customer order email failed:", error.message);
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get your orders",
    });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customerInfo.fullName": { $regex: search, $options: "i" } },
        { "customerInfo.phone": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get admin orders error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get admin order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = order.status;
    const statusChanged = oldStatus !== status;

    order.status = status;

    if (typeof adminNote === "string") {
      order.adminNote = adminNote;
    }

    await order.save();

    if (statusChanged) {
      sendOrderStatusUpdateEmailToCustomer(order).catch((error) => {
        console.error("Order status email failed:", error.message);
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};

module.exports = {
  createOrder,
  getOrderByNumber,
  getMyOrders,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
};