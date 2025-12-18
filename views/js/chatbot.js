// js/chatbot.js - Chatbot Logic
let socket;
let currentToken;

function connectSocket(token) {
  socket = io({
    auth: { token }
  });

  socket.on('jawaban_sejarah', (data) => {
    const jawabanDiv = document.getElementById('jawaban');
    jawabanDiv.innerHTML = data;
    jawabanDiv.classList.add('active');
  });

  socket.on('error', (error) => {
    showChatAlert(error, 'error');
  });

  socket.on('disconnect', () => {
    console.log('Terputus dari server');
  });
}

function kirimPertanyaan() {
  const pesan = document.getElementById('pertanyaan').value.trim();
  
  if (!pesan) {
    alert('Silakan masukkan pertanyaan terlebih dahulu');
    return;
  }

  const jawabanDiv = document.getElementById('jawaban');
  jawabanDiv.innerHTML = '<div class="loading">Mencari jawaban</div>';
  jawabanDiv.classList.add('active');

  socket.emit('pertanyaan_sejarah', pesan);
  document.getElementById('pertanyaan').value = '';
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    kirimPertanyaan();
  }
}

function logout() {
  localStorage.removeItem('authToken');
  if (socket) socket.disconnect();
  currentToken = null;
  showPage('authPage');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('registerName').value = '';
  document.getElementById('registerEmail').value = '';
  document.getElementById('registerPassword').value = '';
}

function showChatAlert(message, type) {
  const alertDiv = document.getElementById('chatAlert');
  if (alertDiv) {
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';

    setTimeout(() => {
      alertDiv.style.display = 'none';
    }, 5000);
  }
}
