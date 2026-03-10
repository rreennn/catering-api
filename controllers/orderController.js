const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { validateCheckoutItems } = require("../utils/checkoutValidator");
const snap = require("../utils/midtrans");
const { getDeliveryDate } = require("../utils/dateHelper");
const sendWhatsApp = require("../utils/sendWhatsApp");

exports.checkoutCart = async (req, res) => {
  const { nama_penerima, no_penerima, alamat_pengiriman, selectedItems } =
    req.body;

  if (!nama_penerima || !no_penerima || !alamat_pengiriman) {
    return res
      .status(400)
      .json({ message: "Nama, nomor, dan alamat penerima wajib diisi" });
  }

  if (!selectedItems || selectedItems.length === 0) {
    return res.status(400).json({ message: "Tidak ada item yang dipilih" });
  }

  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.menu",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart kosong" });
    }

    const itemsToCheckout = cart.items.filter((item) =>
      selectedItems.includes(item._id.toString()),
    );

    if (itemsToCheckout.length === 0) {
      return res.status(400).json({ message: "Item tidak ditemukan di cart" });
    }

    await validateCheckoutItems(itemsToCheckout);

    const total_harga = itemsToCheckout.reduce(
      (total, item) => total + item.harga_item,
      0,
    );

    // ✅ BUAT ORDER DULU DI DATABASE
    const order = await Order.create({
      user: req.user.id,
      nama_penerima,
      no_penerima,
      alamat_pengiriman,
      items: itemsToCheckout,
      total_harga,
      status_pembayaran: "pending",
    });

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + order._id,
        gross_amount: total_harga,
      },
      customer_details: {
        first_name: nama_penerima,
        phone: no_penerima,
        address: alamat_pengiriman,
      },
      item_details: itemsToCheckout.map((item, index) => ({
        id: item._id.toString(),
        price: item.harga_item,
        quantity: 1,
        name: "Menu Catering",
      })),
      callbacks: {
        finish: `${process.env.WEB_URL}/payment-success/ORDER-${order._id}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    order.snap_token = transaction.token;
    order.midtrans_order_id = "ORDER-" + order._id;
    await order.save();

    res.status(201).json({
      message: "Checkout berhasil, lanjutkan pembayaran",
      snapToken: transaction.token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ORDER HISTORY USER =================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // terbaru di atas
      .populate("items.menu")
      .populate("items.carb_dipilih");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET DETAIL ORDER =================
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id, // biar user cuma bisa lihat order firi
    })
      .populate("items.menu")
      .populate("items.carb_dipilih");

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + order._id,
        gross_amount: order.total_harga,
      },
      customer_details: {
        first_name: order.nama_penerima,
        phone: order.no_penerima,
      },
      item_details: order.items.map((item, index) => ({
        id: index + 1,
        price: item.harga_item,
        quantity: 1,
        name: "Menu Catering",
      })),
      callbacks: {
        finish: `${process.env.WEB_URL}/payment-success/ORDER-${order._id}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    order.snap_token = transaction.token;
    order.midtrans_order_id = "ORDER-" + order._id;

    await order.save();

    res.json({
      snap_token: transaction.token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.midtransCallback = async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id.replace("ORDER-", "");
    const transactionStatus = notification.transaction_status;
    const paymentType = notification.payment_type;
    const transactionId = notification.transaction_id;
    const formatPhone = (phone) => {
      if (!phone) return null;
      phone = phone.trim();
      if (phone.startsWith("0")) return "62" + phone.slice(1);
      return phone;
    };
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    if (order.status_pembayaran === "paid") {
      return res.status(200).json({ message: "Order already processed" });
    }
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      order.status_pembayaran = "paid";
      order.midtrans_transaction_id = transactionId;
      order.payment_method = paymentType;
      await order.save();
      if (order.user) {
        const cart = await Cart.findOne({ user: order.user });

        if (cart) {
          const paidItemIds = order.items.map((item) => item._id.toString());

          cart.items = cart.items.filter(
            (item) => !paidItemIds.includes(item._id.toString()),
          );

          await cart.save();
        }
      }
      const message = `
Halo ${order.nama_penerima} 👋

Pembayaran berhasil ✅

Order ID: ${order._id}
Total: Rp ${order.total_harga.toLocaleString()}
Detail pesanan bisa kamu liat disini
    ${process.env.WEB_URL}/payment-success/ORDER-${order._id}

Pesanan kamu sedang diproses 🍽️
Terima kasih sudah order 🙏
`;
      await sendWhatsApp(formatPhone(order.no_penerima), message);
    }
    if (
      transactionStatus === "expire" ||
      transactionStatus === "cancel" ||
      transactionStatus === "deny"
    ) {
      await Order.findByIdAndDelete(orderId);
    }
    res.status(200).json({ message: "OK" });
  } catch (err) {
    console.error("Midtrans callback error:", err);
    res.status(500).json({ message: "Callback error" });
  }
};

exports.checkoutGuest = async (req, res) => {
  const { nama_penerima, no_penerima, alamat_pengiriman, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Item kosong" });
  }

  try {
    const itemsWithDate = items.map((item) => {
      if (!item.hari) throw new Error("Hari menu wajib dikirim");

      const { hari, ...rest } = item;

      return {
        ...rest,
        tanggal_delivery: getDeliveryDate(hari),
        carb_manual_snapshot: rest.carb_manual_snapshot || null,
        extra: rest.extra || null,
      };
    });

    const total_harga = itemsWithDate.reduce(
      (total, item) => total + item.harga_item,
      0,
    );

    const order = await Order.create({
      user: null, // guest
      nama_penerima,
      no_penerima,
      alamat_pengiriman,
      items: itemsWithDate,
      total_harga,
      status_pembayaran: "pending",
    });

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + order._id,
        gross_amount: total_harga,
      },
      customer_details: {
        first_name: nama_penerima,
        phone: no_penerima,
        address: alamat_pengiriman,
      },
      item_details: itemsWithDate.map((item, index) => ({
        id: index + 1,
        price: item.harga_item,
        quantity: 1,
        name: "Menu Catering",
      })),
      callbacks: {
        finish: `${process.env.WEB_URL}/payment-success/ORDER-${order._id}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    order.snap_token = transaction.token;
    order.midtrans_order_id = "ORDER-" + order._id;

    await order.save();

    res.status(201).json({
      message: "Checkout berhasil, lanjutkan pembayaran",
      snapToken: transaction.token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getOrderPublic = async (req, res) => {
  try {
    const cleanId = req.params.id.replace("ORDER-", "");

    const order = await Order.findById(cleanId)
      .populate("items.menu")
      .populate("items.carb_dipilih");

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    if (order.status_pembayaran !== "paid") {
      return res.status(403).json({
        message: "Order belum dibayar",
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
