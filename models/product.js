const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
    size: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
})

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    origin: { type: String, trim: true },
    category: { type: String, trim: true, default: 'Matcha' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    variants: {
        type: [variantSchema],
        validate: (v) => v.length > 0,
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
module.exports = Product