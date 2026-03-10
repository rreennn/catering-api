const express = require("express");
const router = express.Router();

const {
  getCarbTemplates,
  getArchivedCarbTemplates,
  addCarbTemplate,
  updateCarbTemplate,
  deleteCarbTemplate,
  activateCarbTemplate
} = require("../controllers/carbTemplateController");

const { protect, admin } = require("../middleware/auth");

/* PUBLIC */
router.get("/", getCarbTemplates);

/* ADMIN */
router.get("/archived", protect, admin, getArchivedCarbTemplates);
router.post("/", protect, admin, addCarbTemplate);
router.put("/:id", protect, admin, updateCarbTemplate);
router.delete("/:id", protect, admin, deleteCarbTemplate);
router.put("/:id/activate", protect, admin, activateCarbTemplate);

module.exports = router;
