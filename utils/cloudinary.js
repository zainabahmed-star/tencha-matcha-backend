const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadBuffer = (buffer, folder, resourceType) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error)
                resolve(result.secure_url)
            }
        )
        stream.end(buffer)
    })
}

const uploadReceipt = (buffer) =>
    uploadBuffer(buffer, 'tencha-matcha/receipts', 'auto')

const uploadProductImage = (buffer) =>
    uploadBuffer(buffer, 'tencha-matcha/products', 'image')

module.exports = { uploadReceipt, uploadProductImage }