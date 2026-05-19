const streamifier = require("streamifier");
const {
  cloudinary,
  isCloudinaryConfigured,
} = require("../config/cloudinary");

const uploadBufferToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const uploadProductImages = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files uploaded",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadBufferToCloudinary(
        file.buffer,
        "ms-store/products"
      );

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Upload product images error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload images",
    });
  }
};

module.exports = {
  uploadProductImages,
};