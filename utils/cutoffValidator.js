const Menu = require("../models/Menu");
const { isMealStillOrderable } = require("./mealCutoffHelper");

exports.validateCutoff = async (items) => {
  const now = new Date();

  for (const item of items) {
    const menu = await Menu.findById(item.menu);

    if (!menu) continue;

    // ❗ Block jika meal cutoff sudah lewat
    const allowed = isMealStillOrderable(
      item.tanggal_delivery,
      menu.meal_type
    );

    if (!allowed) {
      throw new Error(
        `Batas pemesanan ${menu.meal_type} untuk tanggal tersebut sudah lewat`
      );
    }
  }
};
