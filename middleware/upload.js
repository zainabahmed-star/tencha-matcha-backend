const multer = require('multer')

const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowed.includes(file.mimetype)) {
            return cb(null, true)
        }
        cb(new Error('Receipt must be a JPG, PNG, WebP or PDF file.'))
    },
})

module.exports = upload