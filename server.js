// server.js
// Запуск: npm init -y, npm install express multer cors, node server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Создаем папку mods, если нет
const uploadDir = path.join(__dirname, "mods");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Разрешаем всем сайтам обращаться к API
app.use(cors());
app.use(express.json());

// Получить список модов
app.get("/api/mods", (req, res) => {
  const files = fs.readdirSync(uploadDir).map(file => ({
    title: file,
    url: `/mods/${encodeURIComponent(file)}`
  }));
  res.json(files);
});

// Загрузка модов (только админ)
app.post("/api/upload", upload.single("mod"), (req, res) => {
  res.json({ message: "Файл загружен!" });
});

// Раздача файлов
app.use("/mods", express.static(uploadDir));

// Старт сервера
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
