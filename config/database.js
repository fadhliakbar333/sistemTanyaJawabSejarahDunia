// Konfigurasi koneksi MongoDB Atlas
const mongoose = require('mongoose');

function koneksiDatabase() {
  mongoose.connect(
    'mongodb+srv://fad:albedoo@cluster0.ivmh6by.mongodb.net/sejarah_dunia?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('Koneksi ke MongoDB Atlas berhasil');
  })
  .catch((error) => {
    console.error('Koneksi ke MongoDB gagal:', error);
  });
}

module.exports = koneksiDatabase;

