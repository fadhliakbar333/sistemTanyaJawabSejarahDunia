// js/app.js - Main Application Logic
function showPage(pageName) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  document.getElementById(pageName).classList.add('active');
}

// Check token saat halaman dimuat
window.addEventListener('load', () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    currentToken = token;
    connectSocket(token);
    showPage('chatbotPage');
    const decoded = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('userName').textContent = decoded.nama;
  } else {
    showPage('authPage');
  }
});

// Decode JWT untuk test
function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
}
