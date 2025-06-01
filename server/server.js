const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Permite requisições do frontend
app.use(cors());

// Formatos de vídeo suportados
const SUPPORTED_FORMATS = [
  ".mp4",
  ".avi",
  ".mkv",
  ".mov",
  ".webm",
  ".flv",
  ".wmv",
];

// Endpoint para listar vídeos de um diretório
app.get("/videos", (req, res) => {
  const dir = req.query.dir;
  if (!dir) {
    return res.status(400).json({ error: "Parâmetro dir é obrigatório" });
  }
  try {
    const files = fs.readdirSync(dir);
    const videos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_FORMATS.includes(ext);
      })
      .map((file) => ({
        name: file,
        path: path.join(dir, file),
      }));
    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rota para servir arquivos de vídeo
app.get("/file", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).send("Parâmetro path é obrigatório");
  }
  // Stream do arquivo de vídeo
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send("Arquivo não encontrado");
    }
    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        "Content-Length": stats.size,
        "Content-Type": "video/mp4", // ou detectar pelo ext
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Suporte a streaming parcial (seeking)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4", // ou detectar pelo ext
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    }
  });
});

app.listen(PORT, () => {
  console.log(`API de vídeos rodando em http://localhost:${PORT}`);
});
