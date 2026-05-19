const express = require("express");
const { getAdminCustomers } = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/admin", protect, adminOnly, getAdminCustomers);

module.exports = router;