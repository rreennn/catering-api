const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },

  carb_dipilih: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarbTemplate",
  },

  carb_manual_snapshot: {
    type: String,
  },

  extra: {
    nama: { type: String },
    harga: { type: Number },
  },

  tanggal_delivery: {
    type: Date,
    required: true,
  },

  harga_item: {
    type: Number,
    required: true,
  },
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [CartItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cart", CartSchema);
