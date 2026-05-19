const express = require("express");

const {
  getAdminDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  toggleDiscountCodeStatus,
  deleteDiscountCode,
  validateDiscountCode,
  sendDiscountCodeToCustomers,
} = require("../controllers/discountCodeController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/validate", validateDiscountCode);

router.get("/admin", protect, adminOnly, getAdminDiscountCodes);
router.post("/admin", protect, adminOnly, createDiscountCode);
router.put("/admin/:id", protect, adminOnly, updateDiscountCode);
router.patch(
  "/admin/:id/toggle-status",
  protect,
  adminOnly,
  toggleDiscountCodeStatus
);
router.post(
  "/admin/:id/send-email",
  protect,
  adminOnly,
  sendDiscountCodeToCustomers
);
router.delete("/admin/:id", protect, adminOnly, deleteDiscountCode);

module.exports = router;