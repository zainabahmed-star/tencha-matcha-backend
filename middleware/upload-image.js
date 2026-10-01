const multer = require('multer')

const allowed = ['image/jpeg', 'image/png', 'image/webp']

const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowed.includes(file.mimetype)) {
            return cb(null, true)
        }
        cb(new Error('Image must be a JPG, PNG or WebP file.'))
    },
})

module.exports = uploadImage