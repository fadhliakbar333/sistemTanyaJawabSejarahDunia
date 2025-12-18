// js/auth.js - Authentication Logic dengan Email Verification
let currentEmail = '';

function toggleForm() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

async function register() {
  const nama = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!nama || !email || !password) {
    showAuthAlert('Semua field harus diisi', 'error');
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
      showAuthAlert(data.error || 'Registrasi gagal', 'error');
      return;
    }

    // Simpan email untuk verifikasi
    currentEmail = email;
    
    showAuthAlert('Registrasi berhasil! Kode verifikasi telah dikirim ke email Anda.', 'success');
    
    // Hapus form input
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('verifyCode').value = '';
    
    setTimeout(() => {
      showPage('verifyPage');
    }, 1500);
  } catch (error) {
    showAuthAlert('Terjadi kesalahan: ' + error.message, 'error');
  }
}

/**
 * Verifikasi email dengan kode 6 digit
 */
async function verifyEmail() {
  const kodeVerifikasi = document.getElementById('verifyCode').value.trim();

  if (!kodeVerifikasi || kodeVerifikasi.length !== 6) {
    showVerifyAlert('Kode verifikasi harus 6 digit', 'error');
    return;
  }

  if (!currentEmail) {
    showVerifyAlert('Email tidak ditemukan', 'error');
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
      showVerifyAlert(data.error || 'Verifikasi gagal', 'error');
      return;
    }

    // Simpan token
    localStorage.setItem('authToken', data.token);
    currentToken = data.token;

    showVerifyAlert('✅ Email berhasil diverifikasi! Redirecting...', 'success');
    
    setTimeout(() => {
      connectSocket(data.token);
      showPage('chatbotPage');
    }, 1500);
  } catch (error) {
    showVerifyAlert('Terjadi kesalahan: ' + error.message, 'error');
  }
}

/**
 * Kirim ulang kode verifikasi
 */
async function resendVerification() {
  if (!currentEmail) {
    showVerifyAlert('Email tidak ditemukan', 'error');
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
      showVerifyAlert(data.error || 'Pengiriman ulang gagal', 'error');
      return;
    }

    showVerifyAlert('✅ Kode verifikasi baru telah dikirim ke email Anda.', 'success');
  } catch (error) {
    showVerifyAlert('Terjadi kesalahan: ' + error.message, 'error');
  }
}

/**
 * Kembali ke halaman login
 */
function backToAuth() {
  currentEmail = '';
  document.getElementById('verifyCode').value = '';
  showPage('authPage');
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAuthAlert('Email dan kata sandi harus diisi', 'error');
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
      showAuthAlert(data.error || 'Login gagal', 'error');
      return;
    }

    localStorage.setItem('authToken', data.token);
    currentToken = data.token;
    showAuthAlert('Login berhasil!', 'success');
    setTimeout(() => {
      connectSocket(data.token);
      showPage('chatbotPage');
    }, 1000);
  } catch (error) {
    showAuthAlert('Terjadi kesalahan: ' + error.message, 'error');
  }
}

function showAuthAlert(message, type) {
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
function showVerifyAlert(message, type) {
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
