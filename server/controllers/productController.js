const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get products",
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      isFeatured: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get featured products",
    });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "hidden") {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { badge: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get admin products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get admin products",
    });
  }
};

const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get admin product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get product",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      images,
      colors,
      sizes,
      stock,
      category,
      isFeatured,
      isActive,
      badge,
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and stock are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      images: Array.isArray(images) ? images : [],
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) && sizes.length ? sizes : ["M", "L", "XL"],
      stock: Number(stock),
      category: category || "T-Shirts",
      isFeatured: Boolean(isFeatured),
      isActive: isActive === undefined ? true : Boolean(isActive),
      badge: badge || "",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const fields = [
      "name",
      "description",
      "category",
      "badge",
      "isFeatured",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }

    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }

    if (Array.isArray(req.body.images)) {
      product.images = req.body.images;
    }

    if (Array.isArray(req.body.colors)) {
      product.colors = req.body.colors;
    }

    if (Array.isArray(req.body.sizes)) {
      product.sizes = req.body.sizes;
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: product.isActive
        ? "Product is now visible"
        : "Product is now hidden",
      product,
    });
  } catch (error) {
    console.error("Toggle product status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};