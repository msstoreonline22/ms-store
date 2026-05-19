const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("MS Store API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MS Store API is healthy",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/offers", require("./routes/offerRoutes"));
app.use("/api/discount-codes", require("./routes/discountCodeRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ") || "None"}`);
});