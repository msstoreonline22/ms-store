const express = require("express");

const {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
} = require("../controllers/settingsController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getPublicSettings);

router.get("/admin", protect, adminOnly, getAdminSettings);
router.put("/admin", protect, adminOnly, updateSettings);

module.exports = router;