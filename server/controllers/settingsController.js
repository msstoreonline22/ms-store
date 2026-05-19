const Settings = require("../models/Settings");

const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get settings",
    });
  }
};

const getAdminSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get admin settings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get admin settings",
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    const {
      brandName,
      contactEmail,
      phoneNumbers,
      whatsappNumber,
      instagramUrl,
      instapayNumber,
      deliveryFees,
      announcementText,
      homepageOfferText,
      logoUrl,
    } = req.body;

    if (brandName !== undefined) settings.brandName = brandName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (Array.isArray(phoneNumbers)) settings.phoneNumbers = phoneNumbers;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
    if (instapayNumber !== undefined) settings.instapayNumber = instapayNumber;
    if (announcementText !== undefined) settings.announcementText = announcementText;
    if (homepageOfferText !== undefined) settings.homepageOfferText = homepageOfferText;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;

    if (deliveryFees) {
      if (deliveryFees.cairoGiza !== undefined) {
        settings.deliveryFees.cairoGiza = Number(deliveryFees.cairoGiza);
      }

      if (deliveryFees.otherGovernorates !== undefined) {
        settings.deliveryFees.otherGovernorates = Number(
          deliveryFees.otherGovernorates
        );
      }
    }

    await settings.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
};