const Menu = require("../models/Menu");
const { validateCutoff } = require("./cutoffValidator");

exports.validateCheckoutItems = async (items) => {
  // 1️⃣ cek cutoff meal aware
  await validateCutoff(items);

  for (const item of items) {
    const menu = await Menu.findById(item.menu);

    if (!menu) {
      throw new Error("Menu sudah tidak tersedia");
    }

    // 2️⃣ cek menu aktif
    if (!menu.is_active) {
      throw new Error("Menu sudah diarsip");
    }

    // 3️⃣ validasi harga snapshot
    let hargaAsli = menu.harga_final;

    if (item.extra?.harga) {
      hargaAsli += item.extra.harga;
    }

    if (hargaAsli !== item.harga_item) {
      throw new Error(
        "Harga menu berubah, silakan cek ulang cart"
      );
    }

    // 4️⃣ tanggal tidak boleh masa lalu
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const delivery = new Date(item.tanggal_delivery);
    delivery.setHours(0, 0, 0, 0);

    if (delivery < today) {
      throw new Error("Ada item dengan tanggal delivery sudah lewat");
    }
  }
};
