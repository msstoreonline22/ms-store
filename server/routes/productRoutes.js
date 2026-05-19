const express = require("express");

const {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);

router.get("/admin", protect, adminOnly, getAdminProducts);
router.get("/admin/:id", protect, adminOnly, getAdminProductById);
router.post("/admin", protect, adminOnly, createProduct);
router.put("/admin/:id", protect, adminOnly, updateProduct);
router.patch("/admin/:id/toggle-status", protect, adminOnly, toggleProductStatus);
router.delete("/admin/:id", protect, adminOnly, deleteProduct);

router.get("/:slug", getProductBySlug);

module.exports = router;