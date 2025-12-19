/**
 * SERVICES - CHATBOT
 * File: services/chatbot.js
 * 
 * Fungsi utama untuk memproses pertanyaan pengguna dan menghasilkan response HTML
 * 
 * Alur:
 * 1. Cari di koleksi Sejarah menggunakan regex search
 * 2. Jika tidak ditemukan, cari di koleksi Tokoh
 * 3. Format hasil ke HTML untuk ditampilkan di frontend
 * 4. Jika tidak ditemukan, tampilkan pesan default
 */

const Sejarah = require('../models/sejarah');
const Tokoh = require('../models/tokoh');

/**
 * Fungsi prosesPertanyaan - Memproses pertanyaan dan menghasilkan response
 * 
 * @param {string} pesan - Pertanyaan dari pengguna
 * @returns {string} Response HTML yang siap ditampilkan di frontend
 */
async function prosesPertanyaan(pesan) {
  /**
   * STEP 1: Cari di koleksi Sejarah
   * Menggunakan $regex dengan opsi case-insensitive (i)
   * Mencari di 3 field: judul_sejarah, deskripsi_sejarah, kata_kunci
   */
  const dataSejarah = await Sejarah.findOne({
    $or: [
      { judul_sejarah: { $regex: pesan, $options: 'i' } },
      { deskripsi_sejarah: { $regex: pesan, $options: 'i' } },
      { kata_kunci: { $regex: pesan, $options: 'i' } }
    ]
  });

  /**
   * STEP 2: Cari di koleksi Tokoh (jika sejarah tidak ditemukan)
   * Menggunakan $regex dengan opsi case-insensitive
   * Mencari di 5 field: nama_tokoh, deskripsi_tokoh, bidang_keahlian, kategori, kata_kunci
   */
  const dataTokoh = await Tokoh.findOne({
    $or: [
      { nama_tokoh: { $regex: pesan, $options: 'i' } },
      { deskripsi_tokoh: { $regex: pesan, $options: 'i' } },
      { bidang_keahlian: { $regex: pesan, $options: 'i' } },
      { kategori: { $regex: pesan, $options: 'i' } },
      { kata_kunci: { $regex: pesan, $options: 'i' } }
    ]
  });

  /**
   * STEP 3a: Jika data sejarah ditemukan, format ke HTML
   * Menampilkan semua informasi tentang peristiwa sejarah
   */
  if (dataSejarah) {
    let response = `<div class="history-detail"><h3 style="color: #8b6f47; margin-bottom: 15px; border-bottom: 2px solid #c19a6b; padding-bottom: 10px;">${dataSejarah.judul_sejarah}</h3>`;
    
    // Tampilkan periode
    response += `<div class="history-field"><strong style="color: #5c4033;">📅 Periode:</strong> ${dataSejarah.periode || 'Tidak tersedia'}</div>`;
    
    // Tampilkan kategori
    response += `<div class="history-field"><strong style="color: #5c4033;">🏷️ Kategori:</strong> ${dataSejarah.kategori || 'Tidak tersedia'}</div>`;
    
    // Tampilkan wilayah
    response += `<div class="history-field"><strong style="color: #5c4033;">🌍 Wilayah:</strong> ${dataSejarah.wilayah || 'Tidak tersedia'}</div>`;
    
    // Tampilkan deskripsi lengkap
    response += `<div class="history-field"><strong style="color: #5c4033;">📖 Deskripsi:</strong><p style="margin-top: 8px; line-height: 1.8;">${dataSejarah.deskripsi_sejarah || 'Tidak tersedia'}</p></div>`;
    
    // Tampilkan penyebab jika ada
    if (dataSejarah.penyebab) {
      response += `<div class="history-field"><strong style="color: #5c4033;">🔍 Penyebab:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataSejarah.penyebab}</p></div>`;
    }
    
    // Tampilkan akibat langsung jika ada
    if (dataSejarah.akibat) {
      response += `<div class="history-field"><strong style="color: #5c4033;">⚡ Akibat/Dampak Langsung:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataSejarah.akibat}</p></div>`;
    }
    
    // Tampilkan dampak jangka panjang jika ada
    if (dataSejarah.dampak) {
      response += `<div class="history-field"><strong style="color: #5c4033;">🌟 Dampak Jangka Panjang:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataSejarah.dampak}</p></div>`;
    }
    
    // Tampilkan list tokoh penting jika ada
    if (dataSejarah.tokoh_penting && dataSejarah.tokoh_penting.length > 0) {
      response += `<div class="history-field"><strong style="color: #5c4033;">👥 Tokoh Penting:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataSejarah.tokoh_penting.forEach(tokoh => {
        response += `<li>${tokoh}</li>`;
      });
      response += `</ul></div>`;
    }
    
    // Tampilkan list referensi jika ada
    if (dataSejarah.sumber_referensi && dataSejarah.sumber_referensi.length > 0) {
      response += `<div class="history-field"><strong style="color: #5c4033;">📚 Sumber Referensi:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataSejarah.sumber_referensi.forEach(sumber => {
        response += `<li>${sumber}</li>`;
      });
      response += `</ul></div>`;
    }
    
    // Tampilkan kata kunci jika ada
    if (dataSejarah.kata_kunci) {
      response += `<div class="history-field"><strong style="color: #5c4033;">🔑 Kata Kunci:</strong> <span style="color: #6b5842; font-style: italic;">${dataSejarah.kata_kunci}</span></div>`;
    }
    
    response += `</div>`;
    
    return response;
  }

  /**
   * STEP 3b: Jika data tokoh ditemukan, format ke HTML
   * Menampilkan semua informasi tentang tokoh sejarah
   */
  if (dataTokoh) {
    let response = `<div class="tokoh-detail"><h3 style="color: #8b6f47; margin-bottom: 15px; border-bottom: 2px solid #c19a6b; padding-bottom: 10px;">👤 ${dataTokoh.nama_tokoh}</h3>`;
    
    // Tampilkan periode hidup
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">📅 Periode Hidup:</strong> ${dataTokoh.periode_hidup || 'Tidak tersedia'}</div>`;
    
    // Tampilkan negara asal
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">🌍 Negara Asal:</strong> ${dataTokoh.negara_asal || 'Tidak tersedia'}</div>`;
    
    // Tampilkan bidang keahlian
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">🏷️ Bidang Keahlian:</strong> ${dataTokoh.bidang_keahlian || 'Tidak tersedia'}</div>`;
    
    // Tampilkan kategori
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">🎯 Kategori:</strong> ${dataTokoh.kategori || 'Tidak tersedia'}</div>`;
    
    // Tampilkan deskripsi lengkap
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">📖 Deskripsi:</strong><p style="margin-top: 8px; line-height: 1.8;">${dataTokoh.deskripsi_tokoh || 'Tidak tersedia'}</p></div>`;
    
    // Tampilkan kontribusi utama jika ada
    if (dataTokoh.kontribusi_utama) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">🌟 Kontribusi Utama:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataTokoh.kontribusi_utama}</p></div>`;
    }
    
    // Tampilkan list pencapaian penting jika ada
    if (dataTokoh.pencapaian_penting && dataTokoh.pencapaian_penting.length > 0) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">🏆 Pencapaian Penting:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataTokoh.pencapaian_penting.forEach(pencapaian => {
        response += `<li>${pencapaian}</li>`;
      });
      response += `</ul></div>`;
    }
    
    // Tampilkan pengaruh sejarah jika ada
    if (dataTokoh.pengaruh_sejarah) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">⚡ Pengaruh Sejarah:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataTokoh.pengaruh_sejarah}</p></div>`;
    }
    
    // Tampilkan legacy/warisan jika ada
    if (dataTokoh.legacy) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">💫 Legacy:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataTokoh.legacy}</p></div>`;
    }
    
    // Tampilkan list referensi jika ada
    if (dataTokoh.sumber_referensi && dataTokoh.sumber_referensi.length > 0) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">📚 Sumber Referensi:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataTokoh.sumber_referensi.forEach(sumber => {
        response += `<li>${sumber}</li>`;
      });
      response += `</ul></div>`;
    }
    
    // Tampilkan kata kunci jika ada
    if (dataTokoh.kata_kunci) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">🔑 Kata Kunci:</strong> <span style="color: #6b5842; font-style: italic;">${dataTokoh.kata_kunci}</span></div>`;
    }
    
    response += `</div>`;
    
    return response;
  }

  /**
   * STEP 4: Jika tidak ditemukan di kedua koleksi
   * Tampilkan pesan default untuk user mencoba pertanyaan lain
   */
  return "Maaf, topik atau tokoh sejarah tersebut belum tersedia di database. Coba tanyakan tentang topik atau tokoh sejarah lain yang tersedia.";
}

module.exports = prosesPertanyaan;