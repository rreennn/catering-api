const { getDeliveryDate } = require("../utils/dateHelper");
const Cart = require("../models/Cart");
const Menu = require("../models/Menu");

// GET atau CREATE cart untuk user login
exports.getOrCreateCart = async (req, res) => {
  try {
    const userId = req.user.id; // dari auth middleware

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addItemToCart = async (req, res) => {
  const { menu: menuId, carb_dipilih, extra, hari_dipilih } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart tidak ditemukan" });
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }

    if (!menu.hari_tersedia.includes(hari_dipilih)) {
      return res.status(400).json({
        message: "Menu tidak tersedia di hari tersebut",
      });
    }

    let carbTemplateId = null;
    let carbManualSnapshot = null;

    if (carb_dipilih) {
      if (menu.carb_template && menu.carb_template.length > 0) {
        const isValidTemplate = menu.carb_template.some(
          (id) => id.toString() === carb_dipilih,
        );

        if (!isValidTemplate) {
          return res.status(400).json({
            message: "Pilihan karbo tidak valid untuk menu ini",
          });
        }

        carbTemplateId = carb_dipilih;
      }

      else if (menu.carb_manual) {
        if (carb_dipilih !== menu.carb_manual) {
          return res.status(400).json({
            message: "Pilihan karbo tidak valid untuk menu ini",
          });
        }

        carbManualSnapshot = menu.carb_manual;
      }
    }

    const tanggal_delivery = getDeliveryDate(hari_dipilih);
    let harga_item = menu.harga_final;

    let extraSnapshot = null;

    if (extra) {
      if (!menu.extra?.includes(extra)) {
        return res.status(400).json({
          message: "Extra tidak valid untuk menu ini",
        });
      }

      extraSnapshot = {
        nama: extra,
        harga: menu.harga_extra || 0,
      };

      harga_item += extraSnapshot.harga;
    }

    cart.items.push({
      menu: menuId,
      carb_dipilih: carbTemplateId,
      carb_manual_snapshot: carbManualSnapshot,
      extra: extraSnapshot,
      tanggal_delivery,
      harga_item,
    });

    await cart.save();

    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.menu")
      .populate("items.carb_dipilih");

    if (!cart) return res.status(404).json({ message: "Cart kosong" });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart tidak ditemukan" });

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
