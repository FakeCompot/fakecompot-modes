const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Папка с модами
const MODS_DIR = path.join(__dirname, 'mods');

// Создаем папку mods, если её нет
if (!fs.existsSync(MODS_DIR)) {
    fs.mkdirSync(MODS_DIR);
}

// Раздаем статику для клиента
app.use(express.static(path.join(__dirname, 'public'))); // сюда кладешь свой HTML

// Получить список модов
app.get('/api/mods', (req, res) => {
    const files = fs.readdirSync(MODS_DIR).map(file => {
        return {
            title: path.parse(file).name,
            name: file
        };
    });
    res.json(files);
});

// Скачать мод
app.get('/api/mods/:name', (req, res) => {
    const filePath = path.join(MODS_DIR, req.params.name);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('Мод не найден');
    }
});

// Загрузка мода (только для админа, через POST)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('mod'), (req, res) => {
    if (!req.file) return res.status(400).send('Файл не загружен');
    const targetPath = path.join(MODS_DIR, req.file.originalname);
    fs.renameSync(req.file.path, targetPath);
    res.send('Мод загружен!');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});