const Menu = require("../models/Menu");

// GET all menu (populate carb template)
exports.getMenu = async (req, res) => {
  try {
    const { all } = req.query;

    let filter = {};

    // kalau tidak ada ?all=true → hanya menu aktif
    if (all === "true" && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const menus = await Menu.find(filter).populate("carb_template");

    res.set("Cache-Control", "s-maxage=120");
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET menu by ID
exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate("carb_template");
    if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST add menu (admin only)
exports.addMenu = async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    await menu.populate("carb_template");
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update menu (admin only)
exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });
    await menu.populate("carb_template");
    res.json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE menu (admin only)
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true },
    );

    if (!menu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }

    res.json({ message: "Menu berhasil diarsipkan" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.activateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { is_active: true },
      { new: true },
    );

    if (!menu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }

    res.json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET archived menu (admin only)
exports.getArchivedMenu = async (req, res) => {
  try {
    const menus = await Menu.find({ is_active: false }).populate(
      "carb_template",
    );

    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
