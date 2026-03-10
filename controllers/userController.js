const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.registerUser = async (req, res) => {
    const { nama, email, password, role } = req.body;
    try {
        let userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email sudah terdaftar' });

        // hash password di controller
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ nama, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ 
            id: user._id,
            nama: user.nama,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email tidak ditemukan' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password salah' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            id: user._id,
            nama: user.nama,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
