const DiscountCode = require("../models/DiscountCode");
const User = require("../models/User");
const calculateDiscountCode = require("../utils/calculateDiscountCode");

const { sendDiscountCodeCampaignEmail } = require("../services/emailService");

const normalizeCode = (code) => {
  return String(code || "").toUpperCase().trim();
};

const getAdminDiscountCodes = async (req, res) => {
  try {
    const discountCodes = await DiscountCode.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: discountCodes.length,
      discountCodes,
    });
  } catch (error) {
    console.error("Get discount codes error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get discount codes",
    });
  }
};

const createDiscountCode = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, type, and value are required",
      });
    }

    if (!["percentage", "fixed"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (type === "percentage" && Number(value) > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot be more than 100%",
      });
    }

    const discountCode = await DiscountCode.create({
      code: normalizeCode(code),
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount || 0),
      usageLimit: Number(usageLimit || 0),
      expiresAt: expiresAt || null,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    res.status(201).json({
      success: true,
      message: "Discount code created successfully",
      discountCode,
    });
  } catch (error) {
    console.error("Create discount code error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This discount code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create discount code",
    });
  }
};

const updateDiscountCode = async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    const {
      code,
      type,
      value,
      minOrderAmount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    if (code !== undefined) discountCode.code = normalizeCode(code);
    if (type !== undefined) discountCode.type = type;
    if (value !== undefined) discountCode.value = Number(value);
    if (minOrderAmount !== undefined) {
      discountCode.minOrderAmount = Number(minOrderAmount);
    }
    if (usageLimit !== undefined) {
      discountCode.usageLimit = Number(usageLimit);
    }
    if (expiresAt !== undefined) {
      discountCode.expiresAt = expiresAt || null;
    }
    if (isActive !== undefined) {
      discountCode.isActive = Boolean(isActive);
    }

    if (
      discountCode.type === "percentage" &&
      Number(discountCode.value) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot be more than 100%",
      });
    }

    await discountCode.save();

    res.json({
      success: true,
      message: "Discount code updated successfully",
      discountCode,
    });
  } catch (error) {
    console.error("Update discount code error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This discount code already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update discount code",
    });
  }
};

const toggleDiscountCodeStatus = async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    discountCode.isActive = !discountCode.isActive;
    await discountCode.save();

    res.json({
      success: true,
      message: discountCode.isActive
        ? "Discount code activated"
        : "Discount code deactivated",
      discountCode,
    });
  } catch (error) {
    console.error("Toggle discount code error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update discount code",
    });
  }
};

const deleteDiscountCode = async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    await discountCode.deleteOne();

    res.json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    console.error("Delete discount code error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete discount code",
    });
  }
};

const validateDiscountCode = async (req, res) => {
  try {
    const { code, subtotalAfterOffer } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Discount code is required",
      });
    }

    const discountCode = await DiscountCode.findOne({
      code: normalizeCode(code),
    });

    const result = calculateDiscountCode(
      discountCode,
      Number(subtotalAfterOffer || 0)
    );

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: result.message,
      discountCode: {
        _id: discountCode._id,
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        amount: result.discountAmount,
      },
    });
  } catch (error) {
    console.error("Validate discount code error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to validate discount code",
    });
  }
};

const sendDiscountCodeToCustomers = async (req, res) => {
  try {
    const discountCode = await DiscountCode.findById(req.params.id);

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        message: "Discount code not found",
      });
    }

    if (!discountCode.isActive) {
      return res.status(400).json({
        success: false,
        message: "Activate the discount code before sending it",
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

    const result = await sendDiscountCodeCampaignEmail({
      customers,
      discountCode,
    });

    res.json({
      success: true,
      message: `Discount code email sent to ${result.sent} customer(s).`,
      sent: result.sent,
      failed: result.failed || 0,
    });
  } catch (error) {
    console.error("Send discount code campaign error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to send discount code email",
    });
  }
};

module.exports = {
  getAdminDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  toggleDiscountCodeStatus,
  deleteDiscountCode,
  validateDiscountCode,
  sendDiscountCodeToCustomers,
};