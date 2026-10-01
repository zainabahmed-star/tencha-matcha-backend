const crypto = require('crypto')
const Order = require('../models/order')
const Product = require('../models/product')
const User = require('../models/user')
const { uploadReceipt } = require('../utils/cloudinary')
const { orderReceivedEmail, orderConfirmedEmail, orderRejectedEmail } = require('../utils/email')

// customer: place an order with a receipt
const create = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ err: 'A receipt image is required.' })
        }

        const items = JSON.parse(req.body.items || '[]')
        const shipping = JSON.parse(req.body.shipping || '{}')

        if (!items.length) {
            return res.status(400).json({ err: 'Your cart is empty.' })
        }
        if (!shipping.fullName || !shipping.phone || !shipping.address) {
            return res.status(400).json({ err: 'Name, phone and address are required.' })
        }

        // prices always come from the database, never from the client
        const orderItems = []
        let total = 0

        for (const item of items) {
            const product = await Product.findById(item.productId)
            if (!product || !product.isActive) {
                return res.status(400).json({ err: 'A product in your cart is no longer available.' })
            }

            const variant = product.variants.find((v) => v.size === item.size)
            if (!variant) {
                return res.status(400).json({ err: `Size not available for ${product.name}.` })
            }

            const quantity = Number(item.quantity)
            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({ err: 'Invalid quantity.' })
            }
            if (variant.stock < quantity) {
                return res.status(400).json({ err: `Not enough stock for ${product.name} ${variant.size}.` })
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                size: variant.size,
                price: variant.price,
                quantity,
            })
            total += variant.price * quantity
        }

        total = Math.round(total * 1000) / 1000

        const receiptUrl = await uploadReceipt(req.file.buffer)
        const reference = 'TM-' + crypto.randomBytes(3).toString('hex').toUpperCase()

        const order = await Order.create({
            user: req.user._id,
            reference,
            items: orderItems,
            total,
            shipping,
            receiptUrl,
        })

        const customer = await User.findById(req.user._id)
        if (customer) {
            orderReceivedEmail(customer.email, order)
        }

        res.status(201).json(order)
    } catch (err) {
        res.status(400).json({ err: err.message })
    }
}

// customer: my orders
const mine = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.status(200).json(orders)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

// admin: all orders, optional ?status=
const index = async (req, res) => {
    try {
        const filter = {}
        if (req.query.status) {
            filter.status = req.query.status
        }
        const orders = await Order.find(filter)
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
        res.status(200).json(orders)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

// admin: confirm payment, reduce stock, email the customer
const confirm = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'email')
        if (!order) {
            return res.status(404).json({ err: 'Order not found.' })
        }
        if (order.status !== 'awaiting_verification') {
            return res.status(400).json({ err: `Order is already ${order.status}.` })
        }

        // reduce stock safely; undo if any item is short
        const done = []
        for (const item of order.items) {
            const result = await Product.updateOne(
                { _id: item.product, variants: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } } },
                { $inc: { 'variants.$.stock': -item.quantity } }
            )
            if (result.modifiedCount === 0) {
                for (const d of done) {
                    await Product.updateOne(
                        { _id: d.product, 'variants.size': d.size },
                        { $inc: { 'variants.$.stock': d.quantity } }
                    )
                }
                return res.status(400).json({ err: `Not enough stock for ${item.name} ${item.size}.` })
            }
            done.push(item)
        }

        order.status = 'paid'
        await order.save()

        orderConfirmedEmail(order.user.email, order)
        res.status(200).json(order)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

// admin: reject receipt with a reason, email the customer
const reject = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'email')
        if (!order) {
            return res.status(404).json({ err: 'Order not found.' })
        }
        if (order.status !== 'awaiting_verification') {
            return res.status(400).json({ err: `Order is already ${order.status}.` })
        }

        order.status = 'rejected'
        order.rejectionReason = req.body.reason || ''
        await order.save()

        orderRejectedEmail(order.user.email, order)
        res.status(200).json(order)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports = { create, mine, index, confirm, reject }