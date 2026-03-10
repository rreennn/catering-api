const mongoose = require("mongoose");

const CarbTemplateSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    default_harga: { type: Number },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true },
);

module.exports = mongoose.model("CarbTemplate", CarbTemplateSchema);
