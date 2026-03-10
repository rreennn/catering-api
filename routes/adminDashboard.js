// routes/adminDashboard.js
const express = require("express");
const { protect, admin } = require("../middleware/auth");
const {
  getKitchenSummary,
  getDashboardSummary,
  getOrderStatusSummary,
} = require("../controllers/admin/adminDashboardController");

const router = express.Router();

router.get("/dashboard/kitchen", protect, admin, getKitchenSummary);
router.get("/dashboard/summary", protect, admin, getDashboardSummary);
router.get("/dashboard/order-status", protect, admin, getOrderStatusSummary);

module.exports = router;
