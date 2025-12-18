// routes/sejarah.js
const express = require('express');
const router = express.Router();
const Sejarah = require('../models/sejarah');


// Menambahkan data sejarah
router.post('/tambah', async (req, res) => {
    const dataSejarah = new Sejarah(req.body);
    await dataSejarah.save();
    res.json({ pesan: 'Data sejarah berhasil ditambahkan' });
});

// Menampilkan semua data sejarah
router.get('/', async (req, res) => {
    const daftarSejarah = await Sejarah.find();
    res.json(daftarSejarah);
});

module.exports = router;