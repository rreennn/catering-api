const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema(
  {
    meal_type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    protein: { type: String },
    veggie: { type: String },
    carb_template: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CarbTemplate" },
    ],
    carb_manual: { type: String },
    extra: { type: [String] },
    hari_tersedia: { type: [String], required: true },
    harga_final: { type: Number, required: true },
    harga_extra: { type: Number },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Menu", MenuSchema);
