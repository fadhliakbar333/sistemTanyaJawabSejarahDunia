const Percakapan = require('./models/percakapan');
const prosesPertanyaan = require('./services/chatbot');

io.on('connection', (socket) => {
  socket.on('pertanyaan_sejarah', async (pesan) => {
    const jawaban = prosesPertanyaan(pesan);

    // Simpan ke database
    const dataPercakapan = new Percakapan({
      pertanyaan: pesan,
      jawaban: jawaban
    });

    await dataPercakapan.save();

    socket.emit('jawaban_sejarah', jawaban);
  });
});
