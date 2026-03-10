const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token tidak valid' });
        }
    } else {
        return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
    }
};

// Middleware khusus admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Hanya admin yang bisa mengakses' });
    }
};

module.exports = { protect, admin };
