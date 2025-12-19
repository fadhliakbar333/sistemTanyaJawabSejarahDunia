// js/auth.js - Authentication Logic dengan Email Verification
let currentEmail = '';

function tukarForm() {
  const formMasuk = document.getElementById('formMasuk');
  const formDaftar = document.getElementById('formDaftar');
  formMasuk.style.display = formMasuk.style.display === 'none' ? 'block' : 'none';
  formDaftar.style.display = formDaftar.style.display === 'none' ? 'block' : 'none';
}

async function daftar() {
  const nama = document.getElementById('namaLengkap').value.trim();
  const email = document.getElementById('emailDaftar').value.trim();
  const password = document.getElementById('kataSandiDaftar').value;

  if (!nama || !email || !password) {
    tampilkanAlertAutentikasi('Semua field harus diisi', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_pengguna: nama, email, kata_sandi: password })
    });

    const data = await response.json();

    if (!response.ok) {
      tampilkanAlertAutentikasi(data.error || 'Registrasi gagal', 'error');
      return;
    }

    // Simpan email untuk verifikasi
    currentEmail = email;
    
    tampilkanAlertAutentikasi('Registrasi berhasil! Kode verifikasi telah dikirim ke email Anda.', 'success');
    
    // Hapus form input
    document.getElementById('namaLengkap').value = '';
    document.getElementById('emailDaftar').value = '';
    document.getElementById('kataSandiDaftar').value = '';
    document.getElementById('kodeVerifikasi').value = '';
    
    setTimeout(() => {
      showPage('verifyPage');
    }, 1500);
  } catch (error) {
    tampilkanAlertAutentikasi('Terjadi kesalahan: ' + error.message, 'error');
  }
}

/**
 * Verifikasi email dengan kode 6 digit
 */
async function verifikasiEmail() {
  const kodeVerifikasi = document.getElementById('kodeVerifikasi').value.trim();

  if (!kodeVerifikasi || kodeVerifikasi.length !== 6) {
    tampilkanAlertVerifikasi('Kode verifikasi harus 6 digit', 'error');
    return;
  }

  if (!currentEmail) {
    tampilkanAlertVerifikasi('Email tidak ditemukan', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail, kode_verifikasi: kodeVerifikasi })
    });

    const data = await response.json();

    if (!response.ok) {
      tampilkanAlertVerifikasi(data.error || 'Verifikasi gagal', 'error');
      return;
    }

    // Simpan token
    localStorage.setItem('authToken', data.token);
    currentToken = data.token;

    tampilkanAlertVerifikasi('✅ Email berhasil diverifikasi! Redirecting...', 'success');
    
    setTimeout(() => {
      connectSocket(data.token);
      showPage('chatbotPage');
    }, 1500);
  } catch (error) {
    tampilkanAlertVerifikasi('Terjadi kesalahan: ' + error.message, 'error');
  }
}

/**
 * Kirim ulang kode verifikasi
 */
async function kirimUlangKode() {
  if (!currentEmail) {
    tampilkanAlertVerifikasi('Email tidak ditemukan', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail })
    });

    const data = await response.json();

    if (!response.ok) {
      tampilkanAlertVerifikasi(data.error || 'Pengiriman ulang gagal', 'error');
      return;
    }

    tampilkanAlertVerifikasi('✅ Kode verifikasi baru telah dikirim ke email Anda.', 'success');
  } catch (error) {
    tampilkanAlertVerifikasi('Terjadi kesalahan: ' + error.message, 'error');
  }
}

/**
 * Kembali ke halaman login
 */
function kembaliKeMasuk() {
  currentEmail = '';
  document.getElementById('kodeVerifikasi').value = '';
  showPage('authPage');
}

async function masuk() {
  const email = document.getElementById('emailMasuk').value.trim();
  const password = document.getElementById('kataSandiMasuk').value;

  if (!email || !password) {
    tampilkanAlertAutentikasi('Email dan kata sandi harus diisi', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, kata_sandi: password })
    });

    const data = await response.json();

    if (!response.ok) {
      tampilkanAlertAutentikasi(data.error || 'Login gagal', 'error');
      return;
    }

    localStorage.setItem('authToken', data.token);
    currentToken = data.token;
    tampilkanAlertAutentikasi('Login berhasil!', 'success');
    setTimeout(() => {
      connectSocket(data.token);
      showPage('chatbotPage');
    }, 1000);
  } catch (error) {
    tampilkanAlertAutentikasi('Terjadi kesalahan: ' + error.message, 'error');
  }
}

function tampilkanAlertAutentikasi(message, type) {
  const alertDiv = document.getElementById('authAlert');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';

  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 5000);
}

/**
 * Tampilkan alert di halaman verifikasi
 */
function tampilkanAlertVerifikasi(message, type) {
  const alertDiv = document.getElementById('verifyAlert');
  if (!alertDiv) return;
  
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';

  if (type !== 'error') {
    setTimeout(() => {
      alertDiv.style.display = 'none';
    }, 5000);
  }
}
