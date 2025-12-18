// services/chatbot.js
const Sejarah = require('../models/sejarah');
const Tokoh = require('../models/tokoh');

async function prosesPertanyaan(pesan) {
  // Cari di koleksi Sejarah berdasarkan kata kunci
  const dataSejarah = await Sejarah.findOne({
    $or: [
      { judul_sejarah: { $regex: pesan, $options: 'i' } },
      { deskripsi_sejarah: { $regex: pesan, $options: 'i' } },
      { kata_kunci: { $regex: pesan, $options: 'i' } }
    ]
  });

  // Cari di koleksi Tokoh berdasarkan nama atau deskripsi
  const dataTokoh = await Tokoh.findOne({
    $or: [
      { nama_tokoh: { $regex: pesan, $options: 'i' } },
      { deskripsi_tokoh: { $regex: pesan, $options: 'i' } },
      { bidang_keahlian: { $regex: pesan, $options: 'i' } },
      { kategori: { $regex: pesan, $options: 'i' } },
      { kata_kunci: { $regex: pesan, $options: 'i' } }
    ]
  });

  // Jika data sejarah ditemukan
  if (dataSejarah) {
    let response = `<div class="history-detail"><h3 style="color: #8b6f47; margin-bottom: 15px; border-bottom: 2px solid #c19a6b; padding-bottom: 10px;">${dataSejarah.judul_sejarah}</h3>`;
    
    response += `<div class="history-field"><strong style="color: #5c4033;">📅 Periode:</strong> ${dataSejarah.periode || 'Tidak tersedia'}</div>`;
    
    response += `<div class="history-field"><strong style="color: #5c4033;">🏷️ Kategori:</strong> ${dataSejarah.kategori || 'Tidak tersedia'}</div>`;
    
    response += `<div class="history-field"><strong style="color: #5c4033;">🌍 Wilayah:</strong> ${dataSejarah.wilayah || 'Tidak tersedia'}</div>`;
    
    response += `<div class="history-field"><strong style="color: #5c4033;">📖 Deskripsi:</strong><p style="margin-top: 8px; line-height: 1.8;">${dataSejarah.deskripsi_sejarah || 'Tidak tersedia'}</p></div>`;
    
    if (dataSejarah.penyebab) {
      response += `<div class="history-field"><strong style="color: #5c4033;">🔍 Penyebab:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataSejarah.penyebab}</p></div>`;
    }
    
    if (dataSejarah.akibat) {
      response += `<div class="history-field"><strong style="color: #5c4033;">⚡ Akibat/Dampak Langsung:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataSejarah.akibat}</p></div>`;
    }
    
    if (dataSejarah.dampak) {
      response += `<div class="history-field"><strong style="color: #5c4033;">🌟 Dampak Jangka Panjang:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataSejarah.dampak}</p></div>`;
    }
    
    if (dataSejarah.tokoh_penting && dataSejarah.tokoh_penting.length > 0) {
      response += `<div class="history-field"><strong style="color: #5c4033;">👥 Tokoh Penting:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataSejarah.tokoh_penting.forEach(tokoh => {
        response += `<li>${tokoh}</li>`;
      });
      response += `</ul></div>`;
    }
    
    if (dataSejarah.sumber_referensi && dataSejarah.sumber_referensi.length > 0) {
      response += `<div class="history-field"><strong style="color: #5c4033;">📚 Sumber Referensi:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataSejarah.sumber_referensi.forEach(sumber => {
        response += `<li>${sumber}</li>`;
      });
      response += `</ul></div>`;
    }
    
    if (dataSejarah.kata_kunci) {
      response += `<div class="history-field"><strong style="color: #5c4033;">🔑 Kata Kunci:</strong> <span style="color: #6b5842; font-style: italic;">${dataSejarah.kata_kunci}</span></div>`;
    }
    
    response += `</div>`;
    
    return response;
  }

  // Jika data tokoh ditemukan
  if (dataTokoh) {
    let response = `<div class="tokoh-detail"><h3 style="color: #8b6f47; margin-bottom: 15px; border-bottom: 2px solid #c19a6b; padding-bottom: 10px;">👤 ${dataTokoh.nama_tokoh}</h3>`;
    
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">📅 Periode Hidup:</strong> ${dataTokoh.periode_hidup || 'Tidak tersedia'}</div>`;
    
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">🌍 Negara Asal:</strong> ${dataTokoh.negara_asal || 'Tidak tersedia'}</div>`;
    
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">🏷️ Bidang Keahlian:</strong> ${dataTokoh.bidang_keahlian || 'Tidak tersedia'}</div>`;
    
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">🎯 Kategori:</strong> ${dataTokoh.kategori || 'Tidak tersedia'}</div>`;
    
    response += `<div class="tokoh-field"><strong style="color: #5c4033;">📖 Deskripsi:</strong><p style="margin-top: 8px; line-height: 1.8;">${dataTokoh.deskripsi_tokoh || 'Tidak tersedia'}</p></div>`;
    
    if (dataTokoh.kontribusi_utama) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">🌟 Kontribusi Utama:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataTokoh.kontribusi_utama}</p></div>`;
    }
    
    if (dataTokoh.pencapaian_penting && dataTokoh.pencapaian_penting.length > 0) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">🏆 Pencapaian Penting:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataTokoh.pencapaian_penting.forEach(pencapaian => {
        response += `<li>${pencapaian}</li>`;
      });
      response += `</ul></div>`;
    }
    
    if (dataTokoh.pengaruh_sejarah) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">⚡ Pengaruh Sejarah:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataTokoh.pengaruh_sejarah}</p></div>`;
    }
    
    if (dataTokoh.legacy) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">💫 Legacy:</strong><p style="margin-top: 8px; line-height: 1.6;">${dataTokoh.legacy}</p></div>`;
    }
    
    if (dataTokoh.sumber_referensi && dataTokoh.sumber_referensi.length > 0) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">📚 Sumber Referensi:</strong><ul style="margin-top: 8px; margin-left: 20px;">`;
      dataTokoh.sumber_referensi.forEach(sumber => {
        response += `<li>${sumber}</li>`;
      });
      response += `</ul></div>`;
    }
    
    if (dataTokoh.kata_kunci) {
      response += `<div class="tokoh-field"><strong style="color: #5c4033;">🔑 Kata Kunci:</strong> <span style="color: #6b5842; font-style: italic;">${dataTokoh.kata_kunci}</span></div>`;
    }
    
    response += `</div>`;
    
    return response;
  }

  // Jika tidak ditemukan di kedua koleksi
  return "Maaf, topik atau tokoh sejarah tersebut belum tersedia di database. Coba tanyakan tentang topik atau tokoh sejarah lain yang tersedia.";
}

module.exports = prosesPertanyaan;