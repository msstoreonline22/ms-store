const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const { uploadProductImages } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post(
  "/admin/product-images",
  protect,
  adminOnly,
  upload.array("images", 10),
  uploadProductImages
);

module.exports = router;