require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Test route
app.get("/", (req, res) => res.send("Server is running"));

//route template carb
const carbTemplateRoutes = require("./routes/carbTemplate");
app.use("/api/carb", carbTemplateRoutes);

//route user
const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

//route menu
const menuRoutes = require("./routes/menu");
app.use("/api/menu", menuRoutes);

//route cart
const cartRoutes = require("./routes/cart");
app.use("/api/cart", cartRoutes);

//route order
const orderRoutes = require("./routes/order");
app.use("/api/orders", orderRoutes);

//route admin
const adminOrderRoutes = require("./routes/adminOrder");
app.use("/api/admin", adminOrderRoutes);

const adminDashboardRoutes = require("./routes/adminDashboard");
app.use("/api/admin", adminDashboardRoutes);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;