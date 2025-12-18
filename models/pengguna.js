// Model data pengguna dengan email verification
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skemaPengguna = new mongoose.Schema({
  nama_pengguna: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  kata_sandi: { type: String, required: true },
  peran: { type: String, default: 'pengguna' },
  // Field untuk email verification
  email_terverifikasi: { type: Boolean, default: false },
  kode_verifikasi: { type: String, default: null },
  waktu_kode_kadaluarsa: { type: Date, default: null },
  tanggal_dibuat: { type: Date, default: Date.now }
});

// Hash password sebelum menyimpan
skemaPengguna.pre('save', async function(next) {
  if (!this.isModified('kata_sandi')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.kata_sandi = await bcrypt.hash(this.kata_sandi, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metode untuk membandingkan password
skemaPengguna.methods.bandingkanPassword = async function(passwordInput) {
  return await bcrypt.compare(passwordInput, this.kata_sandi);
};

// Metode untuk verifikasi kode
skemaPengguna.methods.verifikasiKode = function(kodeInput) {
  // Cek apakah kode benar
  if (this.kode_verifikasi !== kodeInput) {
    return false;
  }
  
  // Cek apakah kode masih berlaku (tidak kadaluarsa)
  if (new Date() > this.waktu_kode_kadaluarsa) {
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('Pengguna', skemaPengguna);