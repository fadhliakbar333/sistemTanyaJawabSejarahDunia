/**
 * ROUTES - AUTENTIKASI
 * File: routes/auth.js
 * 
 * Mengelola endpoint untuk:
 * - Register pengguna baru
 * - Verifikasi email dengan kode 6 digit
 * - Pengiriman ulang kode verifikasi
 * - Login pengguna
 * - Verifikasi token JWT
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Pengguna = require('../models/pengguna');
const kirimEmail = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_sejarah_dunia_2024';

/**
 * Fungsi untuk generate kode verifikasi 6 digit random
 * Contoh output: 123456, 987654, dll
 * @returns {string} Kode verifikasi 6 digit
 */
function generateKodeVerifikasi() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * ENDPOINT: POST /api/auth/register
 * Mendaftarkan pengguna baru dengan email dan password
 * 
 * Request Body:
 * {
 *   nama_pengguna: "John Doe",
 *   email: "john@example.com",
 *   kata_sandi: "password123"
 * }
 * 
 * Response:
 * - 201: Registrasi berhasil, kode verifikasi dikirim ke email
 * - 400: Data tidak lengkap atau email sudah terdaftar
 * - 500: Error server
 */
router.post('/register', async (req, res) => {
  try {
    const { nama_pengguna, email, kata_sandi } = req.body;

    // Validasi: Cek apakah semua field sudah diisi
    if (!nama_pengguna || !email || !kata_sandi) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    // Validasi: Cek apakah email sudah terdaftar
    const penggunaSudahAda = await Pengguna.findOne({ email });
    if (penggunaSudahAda) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    // Generate kode verifikasi 6 digit dan set waktu kadaluarsa 15 menit
    const kodeVerifikasi = generateKodeVerifikasi();
    const waktuKadaluarsa = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    // Buat pengguna baru dengan status email belum terverifikasi
    const penggunaBaru = new Pengguna({ 
      nama_pengguna, 
      email, 
      kata_sandi,
      email_terverifikasi: false,
      kode_verifikasi: kodeVerifikasi,
      waktu_kode_kadaluarsa: waktuKadaluarsa
    });
    await penggunaBaru.save();

    // Compose isi email dengan kode verifikasi
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

    // Kirim email secara async (tidak mengganggu flow response)
    try {
      await kirimEmail(email, '📧 Kode Verifikasi Email - ChatBot Sejarah Dunia', isiEmail);
    } catch (emailError) {
      // Jika email gagal, registrasi tetap berhasil
      console.warn('⚠️ Registrasi berhasil tapi email gagal terkirim:', emailError.message);
    }

    // Kirim response sukses
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

/**
 * ENDPOINT: POST /api/auth/verify-email
 * Memverifikasi email pengguna menggunakan kode 6 digit
 * 
 * Request Body:
 * {
 *   email: "john@example.com",
 *   kode_verifikasi: "123456"
 * }
 * 
 * Response:
 * - 200: Email terverifikasi, JWT token dikirim
 * - 400: Kode salah/kadaluarsa, email sudah terverifikasi
 * - 404: Email tidak ditemukan
 * - 500: Error server
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, kode_verifikasi } = req.body;

    // Validasi: Cek input tidak kosong
    if (!email || !kode_verifikasi) {
      return res.status(400).json({ error: 'Email dan kode verifikasi harus diisi' });
    }

    // Cari pengguna berdasarkan email
    const pengguna = await Pengguna.findOne({ email });
    if (!pengguna) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    // Cek apakah email sudah terverifikasi sebelumnya
    if (pengguna.email_terverifikasi) {
      return res.status(400).json({ error: 'Email sudah terverifikasi sebelumnya' });
    }

    // Verifikasi kode: Cek kode cocok dan belum kadaluarsa
    if (!pengguna.verifikasiKode(kode_verifikasi)) {
      return res.status(400).json({ error: 'Kode verifikasi salah atau sudah kadaluarsa' });
    }

    // Update status email menjadi terverifikasi
    pengguna.email_terverifikasi = true;
    pengguna.kode_verifikasi = null;
    pengguna.waktu_kode_kadaluarsa = null;
    await pengguna.save();

    // Compose email konfirmasi
    const isiEmailKonfirmasi = `
Halo ${pengguna.nama_pengguna},

Selamat! Email Anda telah berhasil diverifikasi.

Akun Anda sekarang aktif dan siap digunakan. Anda dapat langsung login dan mulai menggunakan ChatBot Sejarah Dunia.

Login: ${process.env.APP_URL || 'http://localhost:3000'}

Jika ada pertanyaan, hubungi kami di email ini.

Salam,
Tim ChatBot Sejarah Dunia
    `.trim();

    // Kirim email konfirmasi
    try {
      await kirimEmail(email, '✅ Email Berhasil Diverifikasi - ChatBot Sejarah Dunia', isiEmailKonfirmasi);
    } catch (emailError) {
      console.warn('⚠️ Verifikasi berhasil tapi email konfirmasi gagal:', emailError.message);
    }

    // Generate JWT token dengan payload: id, email, nama pengguna
    // Token berlaku selama 7 hari
    const token = jwt.sign(
      { id: pengguna._id, email: pengguna.email, nama: pengguna.nama_pengguna },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Kirim response dengan token
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

/**
 * ENDPOINT: POST /api/auth/resend-verification
 * Mengirim ulang kode verifikasi ke email pengguna
 * Berguna jika pengguna tidak menerima email pertama
 * 
 * Request Body:
 * {
 *   email: "john@example.com"
 * }
 * 
 * Response:
 * - 200: Kode verifikasi baru dikirim
 * - 400: Email sudah terverifikasi atau email tidak ada
 * - 500: Error server
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Validasi: Cek email tidak kosong
    if (!email) {
      return res.status(400).json({ error: 'Email harus diisi' });
    }

    // Cari pengguna
    const pengguna = await Pengguna.findOne({ email });
    if (!pengguna) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    // Cek: Jika email sudah terverifikasi, tidak perlu kirim ulang
    if (pengguna.email_terverifikasi) {
      return res.status(400).json({ error: 'Email sudah terverifikasi' });
    }

    // Generate kode verifikasi baru
    const kodeVerifikasi = generateKodeVerifikasi();
    const waktuKadaluarsa = new Date(Date.now() + 15 * 60 * 1000);

    // Simpan kode baru ke database
    pengguna.kode_verifikasi = kodeVerifikasi;
    pengguna.waktu_kode_kadaluarsa = waktuKadaluarsa;
    await pengguna.save();

    // Compose email dengan kode verifikasi
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

    // Kirim email
    try {
      await kirimEmail(email, '📧 Kode Verifikasi Email (Pengiriman Ulang) - ChatBot Sejarah Dunia', isiEmail);
    } catch (emailError) {
      console.warn('⚠️ Kode tergenerate tapi email gagal terkirim:', emailError.message);
    }

    // Kirim response
    res.json({
      pesan: 'Kode verifikasi baru telah dikirim ke email Anda.',
      email: email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ENDPOINT: POST /api/auth/login
 * Login pengguna dengan email dan password
 * Hanya bisa login jika email sudah terverifikasi
 * 
 * Request Body:
 * {
 *   email: "john@example.com",
 *   kata_sandi: "password123"
 * }
 * 
 * Response:
 * - 200: Login berhasil, JWT token dikirim
 * - 401: Email/password salah
 * - 403: Email belum diverifikasi
 * - 500: Error server
 */
router.post('/login', async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    // Validasi: Cek email dan password diisi
    if (!email || !kata_sandi) {
      return res.status(400).json({ error: 'Email dan kata sandi harus diisi' });
    }

    // Cari pengguna berdasarkan email
    const pengguna = await Pengguna.findOne({ email });
    if (!pengguna) {
      return res.status(401).json({ error: 'Email atau kata sandi salah' });
    }

    // Cek: Email harus sudah terverifikasi sebelum bisa login
    if (!pengguna.email_terverifikasi) {
      return res.status(403).json({ error: 'Email Anda belum diverifikasi. Silakan check inbox email Anda untuk kode verifikasi.' });
    }

    // Bandingkan password input dengan password di database (terenkripsi)
    // Menggunakan bcrypt untuk perbandingan yang aman
    const passwordBenar = await pengguna.bandingkanPassword(kata_sandi);
    if (!passwordBenar) {
      return res.status(401).json({ error: 'Email atau kata sandi salah' });
    }

    // Generate JWT token untuk session pengguna
    const token = jwt.sign(
      { id: pengguna._id, email: pengguna.email, nama: pengguna.nama_pengguna },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Kirim response dengan token
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

/**
 * ENDPOINT: POST /api/auth/verify
 * Memverifikasi apakah JWT token masih valid
 * Biasanya digunakan saat aplikasi dimulai untuk check session
 * 
 * Request Header:
 * Authorization: Bearer <token>
 * 
 * Response:
 * - 200: Token valid
 * - 401: Token tidak valid atau expired
 */
router.post('/verify', (req, res) => {
  try {
    // Ambil token dari Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    // Verify token dengan JWT_SECRET
    // Jika expired atau invalid, akan throw error
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, pengguna: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

module.exports = router;