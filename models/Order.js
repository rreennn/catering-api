const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
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

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    nama_penerima: {
      type: String,
      required: true,
    },

    no_penerima: {
      type: String,
      required: true,
    },

    alamat_pengiriman: {
      type: String,
      required: true,
    },

    items: [OrderItemSchema],

    total_harga: {
      type: Number,
      required: true,
    },

    status_pembayaran: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    status_order: {
      type: String,
      enum: ["diproses", "dimasak", "dikirim", "selesai"],
      default: "diproses",
    },
    //...

    midtrans_transaction_id: {
      type: String,
      default: null,
    },

    midtrans_order_id: {
      type: String,
    },

    payment_method: {
      type: String,
      default: null,
    },

    snap_token: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
