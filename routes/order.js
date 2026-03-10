const express = require("express");
const { protect } = require("../middleware/auth");
const { checkoutCart, getMyOrders, getOrderDetail, createPayment, midtransCallback, checkoutGuest, getOrderPublic } = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", protect, checkoutCart);

router.get("/", protect, getMyOrders);

router.get("/public/:id", getOrderPublic);

router.get("/:id", protect, getOrderDetail);

router.post("/payment/:orderId", protect, createPayment);

router.post("/midtrans-callback", midtransCallback);

router.post("/guest-checkout", checkoutGuest);


module.exports = router;
