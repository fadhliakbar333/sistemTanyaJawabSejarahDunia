// models/tokoh.js - Model untuk tokoh sejarah dunia
const mongoose = require('mongoose');

const tokohSchema = new mongoose.Schema({
  nama_tokoh: {
    type: String,
    required: true,
    unique: true
  },
  deskripsi_tokoh: {
    type: String,
    required: true
  },
  periode_hidup: String,
  negara_asal: String,
  bidang_keahlian: String,
  kontribusi_utama: String,
  pencapaian_penting: [String],
  pengaruh_sejarah: String,
  legacy: String,
  sumber_referensi: [String],
  kategori: String,
  kata_kunci: String,
  foto: String,
  kredit_dibuat: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tokoh', tokohSchema);
