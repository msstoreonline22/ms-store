const mongoose = require("mongoose");

const discountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Discount code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },

    value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },

    usageLimit: {
      type: Number,
      default: 0,
      min: [0, "Usage limit cannot be negative"],
    },

    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

discountCodeSchema.pre("save", function () {
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }
});

module.exports = mongoose.model("DiscountCode", discountCodeSchema);