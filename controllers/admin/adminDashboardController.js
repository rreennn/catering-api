const Order = require("../../models/Order");

//buat dapur tau apa aja yang dimasak
exports.getKitchenSummary = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      "items.tanggal_delivery": { $gte: start, $lte: end },
      status_pembayaran: "paid",
    }).populate("items.menu items.carb_dipilih");

    const summary = {
      breakfast: {
        total_menu: 0,
        protein: {},
        veggie: {},
        carb: {},
        extra: {},
      },
      lunch: { total_menu: 0, protein: {}, veggie: {}, carb: {}, extra: {} },
      dinner: { total_menu: 0, protein: {}, veggie: {}, carb: {}, extra: {} },
    };

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (
          !item.tanggal_delivery ||
          item.tanggal_delivery < start ||
          item.tanggal_delivery > end
        )
          return;

        const menu = item.menu;
        if (!menu) return;

        const mealType = menu.meal_type;

        summary[mealType].total_menu++;

        // Protein
        if (menu.protein) {
          summary[mealType].protein[menu.protein] =
            (summary[mealType].protein[menu.protein] || 0) + 1;
        }

        // Veggie
        if (menu.veggie) {
          summary[mealType].veggie[menu.veggie] =
            (summary[mealType].veggie[menu.veggie] || 0) + 1;
        }

        // Carb (template atau manual)
        let carbName = null;
        if (item.carb_dipilih?.nama) {
          carbName = item.carb_dipilih.nama;
        } else if (item.carb_manual_snapshot) {
          carbName = item.carb_manual_snapshot;
        }

        if (carbName) {
          summary[mealType].carb[carbName] =
            (summary[mealType].carb[carbName] || 0) + 1;
        }

        // Extra
        if (item.extra?.nama) {
          summary[mealType].extra[item.extra.nama] =
            (summary[mealType].extra[item.extra.nama] || 0) + 1;
        }
      });
    });

    res.set("Cache-Control", "s-maxage=120");
    res.json(summary);
  } catch (err) {
    console.error("getKitchenSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

//bisa buat hari lain
exports.getDashboardSummary = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // Hanya ambil order yang sudah bayar / settlement
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status_pembayaran: "paid", // <-- cuma yang bayar
    });

    const summary = {
      total_order: orders.length,
      total_item: 0,
      total_pendapatan: 0,
    };

    orders.forEach((order) => {
      summary.total_pendapatan += order.total_harga;
      summary.total_item += order.items.length;
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3️⃣ STATUS ORDER SUMMARY (buat dashboard admin)
exports.getOrderStatusSummary = async (req, res) => {
  try {
    const statuses = ["diproses", "dimasak", "dikirim", "selesai"];
    const result = {};

    for (const status of statuses) {
      result[status] = await Order.countDocuments({ status_order: status });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
