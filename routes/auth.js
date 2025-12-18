const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Pengguna = require('../models/pengguna');
const kirimEmail = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_sejarah_dunia_2024';

/**
 * Fungsi untuk generate kode verifikasi 6 digit
 * @returns {string} Kode verifikasi 6 digit
 */
function generateKodeVerifikasi() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register pengguna
router.post('/register', async (req, res) => {
  try {
    const { nama_pengguna, email, kata_sandi } = req.body;

    // Validasi input
    if (!nama_pengguna || !email || !kata_sandi) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    // Cek email sudah ada
    const penggunaSudahAda = await Pengguna.findOne({ email });
    if (penggunaSudahAda) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Generate kode verifikasi
    const kodeVerifikasi = generateKodeVerifikasi();
    const waktuKadaluarsa = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Buat pengguna baru (belum terverifikasi)
    const penggunaBaru = new Pengguna({ 
      nama_pengguna, 
      email, 
      kata_sandi,
      email_terverifikasi: false,
      kode_verifikasi: kodeVerifikasi,
      waktu_kode_kadaluarsa: waktuKadaluarsa
    });
    await penggunaBaru.save();

    // Kirim email dengan kode verifikasi
    const isiEmail = `
Halo ${nama_pengguna},

Terima kasih telah mendaftar di ChatBot Sejarah Dunia!

Untuk menyelesaikan pendaftaran, silakan verifikasi email Anda menggunakan kode di bawah:

╔════════════════════════╗
║  KODE VERIFIKASI       ║
║                        ║
║   ${kodeVerifikasi}           ║
║                        ║
╚════════════════════════╝

Kode ini berlaku selama 15 menit.

Informasi Akun:
- Email: ${email}
- Nama: ${nama_pengguna}
- Tanggal Pendaftaran: ${new Date().toLocaleString('id-ID')}

Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.

Salam,
Tim ChatBot Sejarah Dunia
    `.trim();

    // Kirim email secara async
    try {
      await kirimEmail(email, '📧 Kode Verifikasi Email - ChatBot Sejarah Dunia', isiEmail);
    } catch (emailError) {
      console.warn('⚠️ Registrasi berhasil tapi email gagal terkirim:', emailError.message);
    }

    res.status(201).json({
      pesan: 'Registrasi berhasil! Kode verifikasi telah dikirim ke email Anda.',
      email: email,
      penggunaBaru: {
        id: penggunaBaru._id,
        nama_pengguna: penggunaBaru.nama_pengguna,
        email: penggunaBaru.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verifikasi email dengan kode
router.post('/verify-email', async (req, res) => {
  try {
    const { email, kode_verifikasi } = req.body;

    // Validasi input
    if (!email || !kode_verifikasi) {
      return res.status(400).json({ error: 'Email dan kode verifikasi harus diisi' });
    }

    // Cari pengguna
    const pengguna = await Pengguna.findOne({ email });
    if (!pengguna) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    // Cek apakah email sudah terverifikasi
    if (pengguna.email_terverifikasi) {
      return res.status(400).json({ error: 'Email sudah terverifikasi sebelumnya' });
    }

    // Verifikasi kode
    if (!pengguna.verifikasiKode(kode_verifikasi)) {
      return res.status(400).json({ error: 'Kode verifikasi salah atau sudah kadaluarsa' });
    }

    // Update status email terverifikasi
    pengguna.email_terverifikasi = true;
    pengguna.kode_verifikasi = null;
    pengguna.waktu_kode_kadaluarsa = null;
    await pengguna.save();

    // Kirim email konfirmasi
    const isiEmailKonfirmasi = `
Halo ${pengguna.nama_pengguna},

Selamat! Email Anda telah berhasil diverifikasi.

Akun Anda sekarang aktif dan siap digunakan. Anda dapat langsung login dan mulai menggunakan ChatBot Sejarah Dunia.

Login: ${process.env.APP_URL || 'http://localhost:3000'}

Jika ada pertanyaan, hubungi kami di email ini.

Salam,
Tim ChatBot Sejarah Dunia
    `.trim();

    try {
      await kirimEmail(email, '✅ Email Berhasil Diverifikasi - ChatBot Sejarah Dunia', isiEmailKonfirmasi);
    } catch (emailError) {
      console.warn('⚠️ Verifikasi berhasil tapi email konfirmasi gagal:', emailError.message);
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: pengguna._id, email: pengguna.email, nama: pengguna.nama_pengguna },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      pesan: 'Email berhasil diverifikasi! Anda sekarang dapat login.',
      token,
      pengguna: {
        id: pengguna._id,
        nama_pengguna: pengguna.nama_pengguna,
        email: pengguna.email,
        email_terverifikasi: pengguna.email_terverifikasi
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kirim ulang kode verifikasi
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email harus diisi' });
    }

    // Cari pengguna
    const pengguna = await Pengguna.findOne({ email });
    if (!pengguna) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    // Cek apakah email sudah terverifikasi
    if (pengguna.email_terverifikasi) {
      return res.status(400).json({ error: 'Email sudah terverifikasi' });
    }

    // Generate kode verifikasi baru
    const kodeVerifikasi = generateKodeVerifikasi();
    const waktuKadaluarsa = new Date(Date.now() + 15 * 60 * 1000);

    pengguna.kode_verifikasi = kodeVerifikasi;
    pengguna.waktu_kode_kadaluarsa = waktuKadaluarsa;
    await pengguna.save();

    // Kirim email dengan kode verifikasi baru
    const isiEmail = `
Halo ${pengguna.nama_pengguna},

Berikut adalah kode verifikasi terbaru Anda:

╔════════════════════════╗
║  KODE VERIFIKASI       ║
║                        ║
║   ${kodeVerifikasi}           ║
║                        ║
╚════════════════════════╝

Kode ini berlaku selama 15 menit.

Salam,
Tim ChatBot Sejarah Dunia
    `.trim();

    try {
      await kirimEmail(email, '📧 Kode Verifikasi Email (Pengiriman Ulang) - ChatBot Sejarah Dunia', isiEmail);
    } catch (emailError) {
      console.warn('⚠️ Kode tergenerate tapi email gagal terkirim:', emailError.message);
    }

    res.json({
      pesan: 'Kode verifikasi baru telah dikirim ke email Anda.',
      email: email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login pengguna
router.post('/login', async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    // Validasi input
    if (!email || !kata_sandi) {
      return res.status(400).json({ error: 'Email dan kata sandi harus diisi' });
    }

    // Cari pengguna
    const pengguna = await Pengguna.findOne({ email });
    if (!pengguna) {
      return res.status(401).json({ error: 'Email atau kata sandi salah' });
    }

    // Cek apakah email sudah diverifikasi
    if (!pengguna.email_terverifikasi) {
      return res.status(403).json({ error: 'Email Anda belum diverifikasi. Silakan check inbox email Anda untuk kode verifikasi.' });
    }

    // Bandingkan password
    const passwordBenar = await pengguna.bandingkanPassword(kata_sandi);
    if (!passwordBenar) {
      return res.status(401).json({ error: 'Email atau kata sandi salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: pengguna._id, email: pengguna.email, nama: pengguna.nama_pengguna },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      pesan: 'Login berhasil',
      token,
      pengguna: {
        id: pengguna._id,
        nama_pengguna: pengguna.nama_pengguna,
        email: pengguna.email,
        email_terverifikasi: pengguna.email_terverifikasi
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, pengguna: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

module.exports = router;