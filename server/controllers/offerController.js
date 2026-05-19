const Offer = require("../models/Offer");
const User = require("../models/User");

const { sendOfferCampaignEmail } = require("../services/emailService");

const getActiveOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({ isActive: true })
      .populate("products", "name slug price images isActive")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Get active offer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get active offer",
    });
  }
};

const getAdminOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("products", "name slug price images isActive")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    console.error("Get admin offers error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get offers",
    });
  }
};

const getAdminOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "products",
      "name slug price images isActive"
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Get admin offer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get offer",
    });
  }
};

const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      requiredQuantity,
      offerPrice,
      appliesToAllProducts,
      products,
      isActive,
    } = req.body;

    if (!title || requiredQuantity === undefined || offerPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, required quantity, and offer price are required",
      });
    }

    const shouldApplyToAll =
      appliesToAllProducts === undefined ? true : Boolean(appliesToAllProducts);

    if (!shouldApplyToAll && (!Array.isArray(products) || products.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Select at least one product or apply the offer to all products",
      });
    }

    const offer = await Offer.create({
      title: title.trim(),
      description: description || "",
      requiredQuantity: Number(requiredQuantity),
      offerPrice: Number(offerPrice),
      appliesToAllProducts: shouldApplyToAll,
      products: shouldApplyToAll ? [] : products,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    const populatedOffer = await Offer.findById(offer._id).populate(
      "products",
      "name slug price images isActive"
    );

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer: populatedOffer,
    });
  } catch (error) {
    console.error("Create offer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create offer",
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const {
      title,
      description,
      requiredQuantity,
      offerPrice,
      appliesToAllProducts,
      products,
      isActive,
    } = req.body;

    if (title !== undefined) offer.title = title.trim();
    if (description !== undefined) offer.description = description;
    if (requiredQuantity !== undefined) {
      offer.requiredQuantity = Number(requiredQuantity);
    }
    if (offerPrice !== undefined) {
      offer.offerPrice = Number(offerPrice);
    }
    if (appliesToAllProducts !== undefined) {
      offer.appliesToAllProducts = Boolean(appliesToAllProducts);
    }
    if (Array.isArray(products)) {
      offer.products = offer.appliesToAllProducts ? [] : products;
    }
    if (isActive !== undefined) {
      offer.isActive = Boolean(isActive);
    }

    if (!offer.appliesToAllProducts && offer.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one product or apply the offer to all products",
      });
    }

    await offer.save();

    const populatedOffer = await Offer.findById(offer._id).populate(
      "products",
      "name slug price images isActive"
    );

    res.json({
      success: true,
      message: "Offer updated successfully",
      offer: populatedOffer,
    });
  } catch (error) {
    console.error("Update offer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update offer",
    });
  }
};

const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      success: true,
      message: offer.isActive ? "Offer activated" : "Offer deactivated",
      offer,
    });
  } catch (error) {
    console.error("Toggle offer status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update offer",
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await offer.deleteOne();

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
    });
  }
};

const sendOfferToCustomers = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "products",
      "name slug price images isActive"
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (!offer.isActive) {
      return res.status(400).json({
        success: false,
        message: "Activate the offer before sending it",
      });
    }

    const customers = await User.find({
      role: "customer",
      email: { $exists: true, $ne: "" },
    }).select("name email phone");

    if (!customers.length) {
      return res.status(400).json({
        success: false,
        message: "No customers with emails found",
      });
    }

    const result = await sendOfferCampaignEmail({
      customers,
      offer,
    });

    res.json({
      success: true,
      message: `Offer email sent to ${result.sent} customer(s).`,
      sent: result.sent,
      failed: result.failed || 0,
    });
  } catch (error) {
    console.error("Send offer campaign error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send offer email",
    });
  }
};

module.exports = {
  getActiveOffer,
  getAdminOffers,
  getAdminOfferById,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  sendOfferToCustomers,
};