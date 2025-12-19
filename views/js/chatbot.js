/**
 * FRONTEND - CHATBOT LOGIC
 * File: views/js/chatbot.js
 * 
 * Mengelola komunikasi real-time dengan server menggunakan Socket.IO
 * 
 * Fitur:
 * 1. Connect ke server dengan JWT token
 * 2. Kirim pertanyaan ke server
 * 3. Terima jawaban dari server
 * 4. Tampilkan hasil ke UI
 * 5. Handle logout dan disconnect
 */

// Variable global untuk menyimpan socket connection
let socket;
let currentToken;

/**
 * FUNGSI: connectSocket
 * Membuat koneksi Socket.IO ke server
 * 
 * @param {string} token - JWT token dari localStorage
 * 
 * Proses:
 * 1. Initialize Socket.IO dengan token authentication
 * 2. Listen untuk event 'jawaban_sejarah' dari server
 * 3. Tampilkan jawaban ke UI
 * 4. Handle error dari server
 * 5. Handle disconnect event
 */
function connectSocket(token) {
  // Connect ke server Socket.IO dengan token authentication
  socket = io({
    auth: { token }
  });

  /**
   * EVENT: jawaban_sejarah
   * Menerima jawaban dari server saat pertanyaan berhasil diproses
   * Response adalah HTML string yang siap ditampilkan
   */
  socket.on('jawaban_sejarah', (data) => {
    // Ambil element kotakJawaban dan tampilkan jawaban
    const kotakJawaban = document.getElementById('kotakJawaban');
    kotakJawaban.innerHTML = data;
    kotakJawaban.classList.add('active');
  });

  /**
   * EVENT: error
   * Menerima error message dari server
   */
  socket.on('error', (error) => {
    tampilkanAlertChat(error, 'error');
  });

  /**
   * EVENT: disconnect
   * Dijalankan saat connection terputus dari server
   */
  socket.on('disconnect', () => {
    console.log('Terputus dari server');
  });
}

/**
 * FUNGSI: kirimPertanyaan
 * Mengirim pertanyaan dari user ke server via Socket.IO
 * 
 * Proses:
 * 1. Ambil text dari input field
 * 2. Validasi input tidak kosong
 * 3. Tampilkan loading message
 * 4. Emit event ke server
 * 5. Clear input field
 */
function kirimPertanyaan() {
  // Ambil pertanyaan dari input dan hapus whitespace
  const pesan = document.getElementById('inputPertanyaan').value.trim();
  
  // Validasi: Pertanyaan tidak boleh kosong
  if (!pesan) {
    alert('Silakan masukkan pertanyaan terlebih dahulu');
    return;
  }

  // Tampilkan loading state
  const kotakJawaban = document.getElementById('kotakJawaban');
  kotakJawaban.innerHTML = '<div class="loading">Mencari jawaban</div>';
  kotakJawaban.classList.add('active');

  // Emit pertanyaan ke server via Socket.IO
  socket.emit('pertanyaan_sejarah', pesan);
  
  // Kosongkan input field
  document.getElementById('inputPertanyaan').value = '';
}

/**
 * FUNGSI: tanganiTekanTombol
 * Event handler untuk tombol Enter di input field
 * 
 * @param {Event} event - Keyboard event
 */
function tanganiTekanTombol(event) {
  // Jika user menekan Enter, kirim pertanyaan
  if (event.key === 'Enter') {
    kirimPertanyaan();
  }
}

/**
 * FUNGSI: logout
 * Melakukan logout user:
 * 1. Hapus token dari localStorage
 * 2. Disconnect dari Socket.IO
 * 3. Bersihkan form input
 * 4. Kembali ke halaman login
 */
function logout() {
  // Hapus token dari localStorage
  localStorage.removeItem('authToken');
  
  // Disconnect Socket.IO connection
  if (socket) socket.disconnect();
  
  // Clear currentToken variable
  currentToken = null;
  
  // Pindah ke halaman auth
  showPage('authPage');
  
  // Bersihkan semua input fields
  document.getElementById('emailMasuk').value = '';
  document.getElementById('kataSandiMasuk').value = '';
  document.getElementById('namaLengkap').value = '';
  document.getElementById('emailDaftar').value = '';
  document.getElementById('kataSandiDaftar').value = '';
}

/**
 * FUNGSI: tampilkanAlertChat
 * Menampilkan alert message di halaman chat
 * Alert akan hilang otomatis setelah 5 detik
 * 
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe alert: 'success', 'error', 'info'
 */
function tampilkanAlertChat(message, type) {
  // Ambil element alert
  const alertDiv = document.getElementById('chatAlert');
  
  if (alertDiv) {
    // Set class dan text content
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';

    // Auto-hide setelah 5 detik
    setTimeout(() => {
      alertDiv.style.display = 'none';
    }, 5000);
  }
}
