const express = require('express');
const router = express.Router();
const {
    getMenu,
    getMenuById,
    addMenu,
    updateMenu,
    activateMenu,
    getArchivedMenu,
    deleteMenu
} = require('../controllers/menuController');

const { protect, admin } = require('../middleware/auth');

// Semua user bisa lihat menu
router.get('/', getMenu);
router.get('/archived', protect, admin, getArchivedMenu);
router.get('/:id', getMenuById);

// Admin-only routes
router.post('/', protect, admin, addMenu);
router.put('/:id', protect, admin, updateMenu);
router.delete('/:id', protect, admin, deleteMenu);
router.put('/:id/activate', protect, admin, activateMenu);

module.exports = router;
