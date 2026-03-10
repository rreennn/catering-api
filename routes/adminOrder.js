const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/auth");

const {
  getAllOrders,
  getTodayOrders,
  updateOrderStatus,
} = require("../controllers/admin/adminOrderController");

router.use(protect);
router.use(admin);

router.get("/orders", getAllOrders);
router.get("/orders/today", getTodayOrders);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;
