const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: "MS Store Egypt",
      trim: true,
    },

    contactEmail: {
      type: String,
      default: "msstoreegyptonline559@gmail.com",
      trim: true,
    },

    phoneNumbers: {
      type: [String],
      default: [],
    },

    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    instagramUrl: {
      type: String,
      default: "https://www.instagram.com/ms.storeeonlinee/",
      trim: true,
    },

    instapayNumber: {
      type: String,
      default: "01210439134",
      trim: true,
    },

    deliveryFees: {
      cairoGiza: {
        type: Number,
        default: 85,
      },
      otherGovernorates: {
        type: Number,
        default: 150,
      },
    },

    announcementText: {
      type: String,
      default: "3 T-Shirts for 1000 EGP",
      trim: true,
    },

    homepageOfferText: {
      type: String,
      default: "Build your fit: 3 graphic t-shirts for only 1000 EGP.",
      trim: true,
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
