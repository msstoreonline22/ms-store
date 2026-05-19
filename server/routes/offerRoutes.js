const express = require("express");

const {
  getActiveOffer,
  getAdminOffers,
  getAdminOfferById,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  sendOfferToCustomers,
} = require("../controllers/offerController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/active", getActiveOffer);

router.get("/admin", protect, adminOnly, getAdminOffers);
router.get("/admin/:id", protect, adminOnly, getAdminOfferById);
router.post("/admin", protect, adminOnly, createOffer);
router.put("/admin/:id", protect, adminOnly, updateOffer);
router.patch("/admin/:id/toggle-status", protect, adminOnly, toggleOfferStatus);
router.post("/admin/:id/send-email", protect, adminOnly, sendOfferToCustomers);
router.delete("/admin/:id", protect, adminOnly, deleteOffer);

module.exports = router;