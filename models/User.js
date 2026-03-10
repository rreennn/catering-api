const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'pelanggan'], default: 'pelanggan' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
