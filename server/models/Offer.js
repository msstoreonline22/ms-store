const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    requiredQuantity: {
      type: Number,
      required: true,
      default: 3,
      min: [1, "Required quantity must be at least 1"],
    },

    offerPrice: {
      type: Number,
      required: true,
      default: 1000,
      min: [0, "Offer price cannot be negative"],
    },

    appliesToAllProducts: {
      type: Boolean,
      default: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offer", offerSchema);