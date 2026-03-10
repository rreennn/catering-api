const Order = require("../../models/Order");

//lihat semua order plus filter buat lihat perbulan
exports.getAllOrders = async (req, res) => {
  try {
    const { month, deliveryDate } = req.query;

    let filter = {};

    // Filter berdasarkan bulan DELIVERY
    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      filter["items.tanggal_delivery"] = { $gte: start, $lt: end };
    }

    // Filter tanggal spesifik DELIVERY
    if (deliveryDate) {
      const start = new Date(deliveryDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(deliveryDate);
      end.setHours(23, 59, 59, 999);

      filter["items.tanggal_delivery"] = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter)
      .populate("items.menu")
      .populate("items.carb_dipilih")
      .sort({ createdAt: -1 });

    res.json(orders);
    res.set("Cache-Control", "s-maxage=120");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//untuk liat order hari ini
exports.getTodayOrders = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      "items.tanggal_delivery": { $gte: start, $lte: end },
    })
      .populate("items.menu")
      .populate("items.carb_dipilih")
      .sort({ createdAt: 1 });

    res.json(orders);
    res.set("Cache-Control", "s-maxage=120");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update status order opsi : "diproses", "dimasak", "dikirim", "selesai"
exports.updateOrderStatus = async (req, res) => {
  const { status_order, status_pembayaran } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    if (status_order) {
      order.status_order = status_order;
    }

    if (status_pembayaran) {
      order.status_pembayaran = status_pembayaran;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
