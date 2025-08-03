const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Определяем путь к запрашиваемому файлу
    let filePath = req.url === '/' ? 'index.html' : req.url;
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Читаем файл из текущей директории
    fs.readFile(path.join(__dirname, filePath), (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Файл не найден
                fs.readFile(path.join(__dirname, '404.html'), (err404, data404) => {
                    if (err404) {
                        res.writeHead(500);
                        res.end('Internal Server Error');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(data404);
                    }
                });
            } else {
                // Другая ошибка
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            // Успешный ответ
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});