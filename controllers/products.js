const Product = require('../models/product')


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

// admin: create
const create = async (req, res) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json(product)
    } catch (err) {
        res.status(400).json({ err: err.message })
    }
}

// admin: update
const update = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true, runValidators: true }
        )
        if (!product) {
            return res.status(404).json({ err: 'Product not found.' })
        }
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

module.exports = { index, show, create, update, remove }