/**
 * MAIN APPLICATION FILE
 * File: app.js
 * 
 * File utama untuk menjalankan aplikasi ChatBot Sejarah Dunia
 * 
 * Fitur Utama:
 * 1. Setup Express Server dan Socket.IO untuk real-time communication
 * 2. Koneksi ke MongoDB Atlas database
 * 3. Setup API routes untuk auth, sejarah, dan tokoh
 * 4. Verifikasi JWT token untuk Socket.IO connections
 * 5. Handle pertanyaan pengguna dan simpan riwayat chat
 */

// Memuat environment variables dari file .env
// Contoh: JWT_SECRET, MONGODB_URI, EMAIL_USER, etc
require('dotenv').config();

// Memanggil library yang dibutuhkan
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Import konfigurasi dan routes lokal
const koneksiDatabase = require('./config/database');
const ruteSejarah = require('./routes/sejarah');
const ruteTokoh = require('./routes/tokoh');
const ruteAuth = require('./routes/auth');
const prosesPertanyaan = require('./services/chatbot');
const Percakapan = require('./models/percakapan');

/**
 * Konfigurasi JWT Secret
 * Diambil dari environment variable, atau gunakan default untuk development
 */
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_sejarah_dunia_2024';

/**
 * SETUP APLIKASI EXPRESS DAN SERVER HTTP
 * Express digunakan untuk REST API
 * HTTP Server digunakan untuk Socket.IO real-time communication
 */
const aplikasi = express();
const server = http.createServer(aplikasi);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

/**
 * KONEKSI KE DATABASE
 * Connect ke MongoDB Atlas menggunakan Mongoose
 */
koneksiDatabase();

/**
 * MIDDLEWARE - JSON Parser
 * Mengizinkan server menerima request dengan Content-Type: application/json
 */
aplikasi.use(express.json());

/**
 * MIDDLEWARE - Static File Serving
 * Menyajikan file HTML, CSS, JS dari folder 'views' sebagai file statis
 */
aplikasi.use(express.static(path.join(__dirname, 'views')));

/**
 * ROUTES - API ENDPOINTS
 * Setup 3 route utama untuk aplikasi
 */
aplikasi.use('/api/auth', ruteAuth);    // Auth: register, login, verify
aplikasi.use('/api/sejarah', ruteSejarah); // Sejarah: CRUD data
aplikasi.use('/api/tokoh', ruteTokoh);  // Tokoh: CRUD data

/**
 * SOCKET.IO - MIDDLEWARE UNTUK VERIFIKASI TOKEN
 * Setiap client yang ingin terhubung harus mengirim JWT token yang valid
 * Token dikirim saat connection di field 'auth.token'
 * 
 * Alur:
 * 1. Client mencoba connect dengan token
 * 2. Server verify token menggunakan JWT
 * 3. Jika valid, client diterima dan data pengguna disimpan di socket.pengguna
 * 4. Jika invalid, connection ditolak
 */
io.use((socket, next) => {
  // Ambil token dari handshake auth
  const token = socket.handshake.auth.token;
  
  // Jika token tidak ada, tolak connection
  if (!token) {
    return next(new Error('Token tidak ditemukan'));
  }

  try {
    // Verify token menggunakan JWT_SECRET
    // Jika valid, decode berisi: id, email, nama pengguna
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Simpan data pengguna di socket untuk digunakan di event handler
    socket.pengguna = decoded;
    
    // Lanjutkan ke connection handler
    next();
  } catch (error) {
    // Jika token invalid atau expired, tolak connection
    next(new Error('Token tidak valid'));
  }
});

/**
 * SOCKET.IO - CONNECTION HANDLER
 * Dijalankan saat client berhasil connect ke server
 * Setup event listeners untuk komunikasi real-time
 */
io.on('connection', (socket) => {
  // Log: Client berhasil terhubung
  console.log(`Pengguna ${socket.pengguna.nama} terhubung ke ChatBot`);

  /**
   * EVENT: pertanyaan_sejarah
   * Dijalankan saat pengguna mengirim pertanyaan
   * 
   * Proses:
   * 1. Terima pesan/pertanyaan dari client
   * 2. Proses pertanyaan menggunakan service chatbot
   * 3. Simpan percakapan ke database
   * 4. Kirim jawaban kembali ke client
   */
  socket.on('pertanyaan_sejarah', async (pesan) => {
    try {
      // Proses pertanyaan dan dapatkan response HTML
      const jawaban = await prosesPertanyaan(pesan);

      // Simpan riwayat percakapan ke database
      // Berguna untuk tracking dan analytics user
      const dataPercakapan = new Percakapan({ 
        pertanyaan: pesan, 
        jawaban,
        pengguna_id: socket.pengguna.id,
        email: socket.pengguna.email
      });
      await dataPercakapan.save();

      // Kirim jawaban kembali ke client via socket
      socket.emit('jawaban_sejarah', jawaban);
    } catch (error) {
      // Jika ada error, kirim pesan error ke client
      socket.emit('error', 'Terjadi kesalahan saat memproses pertanyaan');
      console.error('Error processing question:', error);
    }
  });

  /**
   * EVENT: disconnect
   * Dijalankan saat client terputus dari server
   * Bisa karena user logout, network error, atau close browser
   */
  socket.on('disconnect', () => {
    console.log(`Pengguna ${socket.pengguna.nama} terputus dari ChatBot`);
  });
});

/**
 * START SERVER
 * Jalankan server pada port 3000
 * Bisa diubah via environment variable PORT
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});