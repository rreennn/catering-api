const express = require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();
const {
  getOrCreateCart,
  addItemToCart,
  getMyCart,
  removeItemFromCart,
} = require("../controllers/cartController");

router.get("/", protect, getOrCreateCart);
router.get("/me", protect, getMyCart);
router.post("/item", protect, addItemToCart);
router.delete("/item/:itemId", protect, removeItemFromCart);

module.exports = router;
