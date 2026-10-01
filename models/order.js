const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    shipping: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
    },
    receiptUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ['awaiting_verification', 'paid', 'rejected', 'cancelled'],
        default: 'awaiting_verification',
    },
    rejectionReason: { type: String, default: '' },
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)
module.exports = Order