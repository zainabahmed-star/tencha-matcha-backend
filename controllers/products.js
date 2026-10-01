const Product = require('../models/product')
const { uploadProductImage } = require('../utils/cloudinary')

// builds the product fields from the request (JSON or multipart form)
const buildData = (req) => {
    const data = {}
    const { name, origin, category, description, isActive, variants } = req.body

    if (name !== undefined) data.name = name
    if (origin !== undefined) data.origin = origin
    if (category !== undefined) data.category = category
    if (description !== undefined) data.description = description
    if (isActive !== undefined) data.isActive = isActive === true || isActive === 'true'
    if (variants !== undefined) {
        data.variants = typeof variants === 'string' ? JSON.parse(variants) : variants
    }
    return data
}

// public: active products, optional ?search= and ?category=
const index = async (req, res) => {
    try {
        const filter = { isActive: true }

        if (req.query.category) {
            filter.category = req.query.category
        }
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' }
        }

        const products = await Product.find(filter).sort({ createdAt: -1 })
        res.status(200).json(products)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

// admin: all products, including hidden ones
const adminIndex = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 })
        res.status(200).json(products)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

// public: one product
const show = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
        if (!product) {
            return res.status(404).json({ err: 'Product not found.' })
        }
        res.status(200).json(product)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

// admin: create (optional image file)
const create = async (req, res) => {
    try {
        const data = buildData(req)
        if (req.file) {
            data.image = await uploadProductImage(req.file.buffer)
        }
        const product = await Product.create(data)
        res.status(201).json(product)
    } catch (err) {
        res.status(400).json({ err: err.message })
    }
}

// admin: update (optional new image file)
const update = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
        if (!product) {
            return res.status(404).json({ err: 'Product not found.' })
        }

        const data = buildData(req)
        if (req.file) {
            data.image = await uploadProductImage(req.file.buffer)
        }

        product.set(data)
        await product.save()
        res.status(200).json(product)
    } catch (err) {
        res.status(400).json({ err: err.message })
    }
}

// admin: delete
const remove = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId)
        if (!product) {
            return res.status(404).json({ err: 'Product not found.' })
        }
        res.status(200).json({ message: 'Product deleted.' })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports = { index, adminIndex, show, create, update, remove }