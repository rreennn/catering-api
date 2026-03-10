const CarbTemplate = require("../models/CarbTemplate");

/* ================= GET ACTIVE ================= */
exports.getCarbTemplates = async (req, res) => {
  try {
    const carbs = await CarbTemplate.find({ is_active: true });
    res.json(carbs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ARCHIVED ================= */
exports.getArchivedCarbTemplates = async (req, res) => {
  try {
    const carbs = await CarbTemplate.find({ is_active: false });
    res.json(carbs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE ================= */
exports.addCarbTemplate = async (req, res) => {
  try {
    const newCarb = new CarbTemplate(req.body);
    const savedCarb = await newCarb.save();
    res.status(201).json(savedCarb);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateCarbTemplate = async (req, res) => {
  try {
    const carb = await CarbTemplate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!carb)
      return res.status(404).json({ message: "CarbTemplate tidak ditemukan" });

    res.json(carb);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= SOFT DELETE ================= */
exports.deleteCarbTemplate = async (req, res) => {
  try {
    const carb = await CarbTemplate.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true },
    );

    if (!carb)
      return res.status(404).json({ message: "CarbTemplate tidak ditemukan" });

    res.json({ message: "CarbTemplate berhasil diarsipkan" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= ACTIVATE ================= */
exports.activateCarbTemplate = async (req, res) => {
  try {
    const carb = await CarbTemplate.findByIdAndUpdate(
      req.params.id,
      { is_active: true },
      { new: true },
    );

    if (!carb)
      return res.status(404).json({ message: "CarbTemplate tidak ditemukan" });

    res.json(carb);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
