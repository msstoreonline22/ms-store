const express = require("express");

const {
  createOrder,
  getOrderByNumber,
  getMyOrders,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", optionalProtect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/track/:orderNumber", getOrderByNumber);

router.get("/admin", protect, adminOnly, getAdminOrders);
router.get("/admin/:id", protect, adminOnly, getAdminOrderById);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;