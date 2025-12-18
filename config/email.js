// config/email.js - Konfigurasi Nodemailer untuk mengirim email
const nodemailer = require('nodemailer');

// Inisialisasi transporter email dengan kredensial Gmail
const pengirimEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // Gunakan email yang terdaftar di environment variable
    user: process.env.EMAIL_USER,
    // Gunakan App Password bukan password akun biasa (untuk keamanan)
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Nonaktifkan verifikasi sertifikat TLS untuk kompatibilitas
    rejectUnauthorized: false
  }
});

/**
 * Fungsi untuk mengirim email
 * @param {string} tujuan - Email penerima
 * @param {string} subjek - Subjek email
 * @param {string} isi - Isi email (text atau HTML)
 * @param {boolean} isHtml - Flag apakah isi adalah HTML (default: false)
 * @returns {Promise} - Promise yang resolve/reject berdasarkan hasil pengiriman
 */
function kirimEmail(tujuan, subjek, isi, isHtml = false) {
  return new Promise((resolve, reject) => {
    // Validasi kredensial email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Error: EMAIL_USER atau EMAIL_PASSWORD tidak terdefinisi di .env');
      return reject(new Error('Kredensial email tidak dikonfigurasi'));
    }

    // Validasi input parameter
    if (!tujuan || !subjek || !isi) {
      console.error('❌ Error: Parameter email tidak lengkap');
      return reject(new Error('Parameter email tidak lengkap'));
    }

    // Siapkan opsi email
    const opsiEmail = {
      from: process.env.EMAIL_USER || 'noreply@sejarah.com',
      to: tujuan,
      subject: subjek,
      // Gunakan 'html' jika isHtml true, 'text' jika false
      [isHtml ? 'html' : 'text']: isi
    };

    // Kirim email melalui transporter
    pengirimEmail.sendMail(opsiEmail, (error, info) => {
      if (error) {
        console.error('❌ Error mengirim email ke', tujuan, ':', error.message);
        reject(error);
      } else {
        console.log('✅ Email berhasil terkirim ke', tujuan);
        console.log('📧 Response:', info.response);
        resolve(info);
      }
    });
  });
}

module.exports = kirimEmail;