const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'images', 'projets'));
    },
    filename: function (req, file, cb) {
        const suffixeUnique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, suffixeUnique + path.extname(file.originalname));
    }
});

function filtreImage(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont acceptées.'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: filtreImage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
