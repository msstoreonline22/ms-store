const express = require("express");

const {
  getOverview,
  getDetailedAnalytics,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/admin/overview", protect, adminOnly, getOverview);
router.get("/admin/details", protect, adminOnly, getDetailedAnalytics);

module.exports = router;