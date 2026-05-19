const dotenv = require("dotenv");
const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const Offer = require("../models/Offer");

dotenv.config();

const defaultSizes = ["M", "L", "XL"];

const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const products = [
  {
    name: "17 Shirt",
    description:
      "Premium cotton graphic t-shirt with a clean streetwear print. Built for everyday outfits with a bold MS Store feel.",
    price: 500,
    images: [
      "/images/products/17-shirt-1.webp",
      "/images/products/17-shirt-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "12 Shirt",
    description:
      "Premium cotton graphic t-shirt with a standout printed design and relaxed streetwear energy.",
    price: 500,
    images: [
      "/images/products/12-shirt-1.webp",
      "/images/products/12-shirt-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Ghost Shirt",
    description:
      "Graphic cotton t-shirt made for a clean but bold outfit. Soft feel, easy fit, and statement print.",
    price: 500,
    images: [
      "/images/products/ghost-shirt-1.webp",
      "/images/products/ghost-shirt-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Rose Shirt",
    description:
      "Cotton graphic t-shirt with an artistic rose-inspired design. A premium casual piece for daily wear.",
    price: 500,
    images: [
      "/images/products/rose-shirt-1.webp",
      "/images/products/rose-shirt-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Music Shirt",
    description:
      "Premium cotton t-shirt with a music-inspired graphic print. One of the key MS Store statement pieces.",
    price: 500,
    images: [
      "/images/products/music-shirt-1.webp",
      "/images/products/music-shirt-2.webp",
      "/images/products/music-shirt-3.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "MX Shirt",
    description:
      "Graphic cotton t-shirt with a clean MS Store streetwear identity. Easy to style and made for everyday wear.",
    price: 500,
    images: [
      "/images/products/mx-shirt-1.webp",
      "/images/products/mx-shirt-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Music White",
    description:
      "White music graphic t-shirt. Soft cotton, clean base, and a bold printed front.",
    price: 500,
    images: ["/images/products/music-white-1.webp"],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Money Shirt",
    description:
      "Premium cotton t-shirt with a money-inspired graphic design. A bold streetwear piece with strong visual energy.",
    price: 500,
    images: [
      "/images/products/money-shirt-1.webp",
      "/images/products/money-shirt-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "XO Shirt",
    description:
      "Cotton graphic t-shirt with a clean XO-inspired design. Simple, bold, and easy to style.",
    price: 500,
    images: ["/images/products/xo-shirt-1.webp"],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Oversized Black",
    description:
      "Oversized black t-shirt with a clean streetwear fit and premium everyday feel.",
    price: 500,
    images: [
      "/images/products/oversized-black-1.webp",
      "/images/products/oversized-black-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Splash Shirt",
    description:
      "Graphic splash design t-shirt made for bold casual outfits and clean streetwear styling.",
    price: 500,
    images: ["/images/products/splash-shirt-1.webp"],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Oversized White",
    description:
      "Oversized white t-shirt with a clean streetwear fit and premium everyday feel.",
    price: 500,
    images: [
      "/images/products/oversized-white-1.webp",
      "/images/products/oversized-white-2.webp",
    ],
    colors: [],
    sizes: defaultSizes,
    stock: 10,
    category: "T-Shirts",
    badge: "",
    isFeatured: true,
    isActive: true,
  },
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    await User.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    await Offer.deleteMany({});

    const admin = await User.create({
      name: "MS Store Admin",
      email: "admin@msstore.com",
      password: "admin123",
      phone: "",
      role: "admin",
    });

    const productsWithSlugs = products.map((product) => ({
      ...product,
      slug: createSlug(product.name),
    }));

    await Product.insertMany(productsWithSlugs);

    await Settings.create({
      brandName: "MS Store Egypt",
      contactEmail:
        process.env.OWNER_EMAIL || "msstoreegyptonline559@gmail.com",
      phoneNumbers: [],
      whatsappNumber: "",
      instagramUrl: "https://www.instagram.com/ms.storeeonlinee/",
      instapayNumber: "",
      deliveryFees: {
        cairoGiza: 85,
        otherGovernorates: 150,
      },
      announcementText: "3 T-Shirts for 1000 EGP",
      homepageOfferText:
        "Build your fit: 3 graphic t-shirts for only 1000 EGP.",
      logoUrl: "",
    });

    await Offer.create({
      title: "3 T-Shirts for 1000 EGP",
      description: "Buy any 3 MS Store graphic t-shirts for only 1000 EGP.",
      requiredQuantity: 3,
      offerPrice: 1000,
      appliesToAllProducts: true,
      products: [],
      isActive: true,
    });

    console.log("Seed completed successfully");
    console.log("--------------------------------");
    console.log("Admin account:");
    console.log(`Email: ${admin.email}`);
    console.log("Password: admin123");
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
