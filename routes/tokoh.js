// routes/tokoh.js
const express = require('express');
const router = express.Router();
const Tokoh = require('../models/tokoh');


// Menambahkan data tokoh
router.post('/tambah', async (req, res) => {
    const dataTokoh = new Tokoh(req.body);
    await dataTokoh.save();
    res.json({ pesan: 'Data tokoh berhasil ditambahkan' });
});

// Menampilkan semua data tokoh
router.get('/', async (req, res) => {
    const daftarTokoh = await Tokoh.find();
    res.json(daftarTokoh);
});

// Mencari tokoh berdasarkan nama
router.get('/cari/:nama', async (req, res) => {
    const tokoh = await Tokoh.findOne({
        nama_tokoh: { $regex: req.params.nama, $options: 'i' }
    });
    if (tokoh) {
        res.json(tokoh);
    } else {
        res.json({ pesan: 'Tokoh tidak ditemukan' });
    }
});

module.exports = router;
