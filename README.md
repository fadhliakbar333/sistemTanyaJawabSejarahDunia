# 🌍 Program Sistem Tanya Jawab Sejarah Dunia Berbasis Web

Program Sistem Tanya Jawab Sejarah Dunia merupakan aplikasi berbasis web yang dikembangkan menggunakan **Node.js** dan **Express.js**. Aplikasi ini memungkinkan pengguna memperoleh informasi mengenai sejarah dunia melalui **ChatBot real-time** yang terintegrasi dengan **Socket.io**, **REST API**, **MongoDB**, dan **layanan email**.

---

## 📌 Fitur Utama

- 🔐 Login dan Register Pengguna
- 🤖 ChatBot Sejarah Dunia secara Real-Time
- 📚 Manajemen Data Sejarah Dunia
- 📡 REST API menggunakan Express.js
- 💬 Komunikasi Real-Time menggunakan Socket.io
- 🗄️ Penyimpanan Data menggunakan MongoDB
- 📧 Pengiriman Email Notifikasi
- 📜 Penyimpanan Riwayat Percakapan
- 👤 Hak akses pengguna

---

## 🛠️ Teknologi yang Digunakan

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- Nodemailer
- HTML
- CSS
- JavaScript

---

## 📂 Struktur Folder

```
program-sejarah-dunia/
│
├── app.js
├── package.json
├── .env
│
├── config/
│   ├── database.js
│   └── email.js
│
├── models/
│   ├── pengguna.js
│   ├── sejarah.js
│   └── percakapan.js
│
├── routes/
│   ├── auth.js
│   └── sejarah.js
│
├── services/
│   └── chatbot.js
│
├── sockets/
│   └── chatbotSocket.js
│
├── views/
│   ├── index.html
│   ├── login.html
│   └── register.html
│
└── README.md
```

---

## ⚙️ Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/program-sejarah-dunia.git
```

Masuk ke folder proyek

```bash
cd program-sejarah-dunia
```

---

### 2. Install Dependency

```bash
npm install
```

atau

```bash
npm install express mongoose socket.io nodemailer dotenv bcrypt express-session
```

---

### 3. Jalankan MongoDB

Pastikan MongoDB sudah aktif.

Contoh koneksi lokal:

```
mongodb://127.0.0.1:27017/sejarah_dunia
```

---

### 4. Konfigurasi File `.env`

Buat file `.env`

```env
PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/sejarah_dunia

EMAIL_USER=email@gmail.com
EMAIL_PASS=password_aplikasi
```

---

### 5. Menjalankan Program

```bash
node app.js
```

atau menggunakan Nodemon

```bash
npm run dev
```

---

## 🌐 Akses Aplikasi

Buka browser

```
http://localhost:3000
```

---

## 📡 REST API

### Login

```
POST /login
```

### Register

```
POST /register
```

### Menampilkan Data Sejarah

```
GET /api/sejarah
```

### Menambah Data Sejarah

```
POST /api/sejarah/tambah
```

---

## 💬 ChatBot

ChatBot menggunakan **Socket.io**.

Alur kerja:

1. Pengguna mengirim pertanyaan.
2. Server menerima pesan.
3. Sistem mencari informasi sejarah.
4. ChatBot mengirim jawaban secara real-time.
5. Percakapan disimpan ke MongoDB.

---

## 🗃️ Database MongoDB

### Koleksi Pengguna

| Field | Tipe |
|--------|------|
| nama_pengguna | String |
| email | String |
| kata_sandi | String |
| peran | String |

### Koleksi Sejarah

| Field | Tipe |
|--------|------|
| judul_sejarah | String |
| deskripsi_sejarah | String |
| periode | String |
| kata_kunci | String |

### Koleksi Percakapan

| Field | Tipe |
|--------|------|
| id_pengguna | ObjectId |
| pertanyaan | String |
| jawaban | String |
| waktu | Date |

---

## 🔄 Alur Sistem

```
Pengguna
    │
    ▼
Login / Register
    │
    ▼
Halaman ChatBot
    │
    ▼
Mengirim Pertanyaan
    │
    ▼
Socket.io
    │
    ▼
Server Express
    │
    ▼
MongoDB
    │
    ▼
Jawaban ChatBot
    │
    ▼
Ditampilkan ke Pengguna
```

---

## 📌 Pengembangan Selanjutnya

- Integrasi AI seperti ChatGPT atau Gemini.
- Dashboard Admin.
- Pencarian sejarah berdasarkan kategori.
- Upload gambar tokoh sejarah.
- Statistik penggunaan ChatBot.
- Fitur favorit dan riwayat pencarian.

---

## 👨‍💻 Pengembang

**Fadhli Akbar Sahendra**

Program Studi Informatika

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan tugas akademik.
