// Model data sejarah dunia
const mongoose = require('mongoose');


const skemaSejarah = new mongoose.Schema({
    judul_sejarah: { type: String, required: true, unique: true },
    deskripsi_sejarah: { type: String, required: true },
    periode: { type: String },
    kata_kunci: { type: String },
    wilayah: { type: String },                    // Wilayah geografis
    tokoh_penting: { type: [String] },             // Array tokoh-tokoh penting
    dampak: { type: String },                      // Dampak jangka panjang
    penyebab: { type: String },                    // Penyebab utama
    akibat: { type: String },                      // Akibat langsung
    sumber_referensi: { type: [String] },          // Array referensi buku/website
    kategori: { type: String },                    // Kategori: Perang, Revolusi, Dinasti, Peradaban, dll
    foto: { type: String },                        // URL foto sejarah
    kredit_dibuat: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Sejarah', skemaSejarah);