// Memuat environment variables dari file .env
require('dotenv').config();

// Memanggil library yang dibutuhkan
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const koneksiDatabase = require('./config/database');
const ruteSejarah = require('./routes/sejarah');
const ruteTokoh = require('./routes/tokoh');
const ruteAuth = require('./routes/auth');
const prosesPertanyaan = require('./services/chatbot');
const Percakapan = require('./models/percakapan');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_sejarah_dunia_2024';

// Inisialisasi aplikasi express
const aplikasi = express();
const server = http.createServer(aplikasi);
const io = socketIo(server);


// Koneksi ke database MongoDB
koneksiDatabase();


// Middleware untuk membaca JSON
aplikasi.use(express.json());


// Menyajikan file statis untuk halaman web
aplikasi.use(express.static(path.join(__dirname, 'views')));


// Menggunakan API auth
aplikasi.use('/api/auth', ruteAuth);

// Menggunakan API sejarah
aplikasi.use('/api/sejarah', ruteSejarah);

// Menggunakan API tokoh
aplikasi.use('/api/tokoh', ruteTokoh);


// Middleware untuk verifikasi token di Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Token tidak ditemukan'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.pengguna = decoded;
    next();
  } catch (error) {
    next(new Error('Token tidak valid'));
  }
});

// Socket ChatBot
io.on('connection', (socket) => {
  console.log(`Pengguna ${socket.pengguna.nama} terhubung ke ChatBot`);

  socket.on('pertanyaan_sejarah', async (pesan) => {
    try {
      const jawaban = await prosesPertanyaan(pesan);

      // Simpan riwayat percakapan
      const dataPercakapan = new Percakapan({ 
        pertanyaan: pesan, 
        jawaban,
        pengguna_id: socket.pengguna.id,
        email: socket.pengguna.email
      });
      await dataPercakapan.save();

      socket.emit('jawaban_sejarah', jawaban);
    } catch (error) {
      socket.emit('error', 'Terjadi kesalahan saat memproses pertanyaan');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Pengguna ${socket.pengguna.nama} terputus dari ChatBot`);
  });
});


// Menjalankan server
server.listen(3000, () => {
  console.log('Server berjalan pada port 3000');
});