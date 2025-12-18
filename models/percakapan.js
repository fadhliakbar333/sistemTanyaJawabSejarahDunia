// Model untuk menyimpan riwayat percakapan pengguna dengan ChatBot
const mongoose = require('mongoose');

const skemaPercakapan = new mongoose.Schema({
  pertanyaan: { type: String, required: true },
  jawaban: { type: String, required: true },
  pengguna_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pengguna' },
  email: { type: String },
  tanggal: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Percakapan', skemaPercakapan);
