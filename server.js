const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')

const PORT = process.env.PORT ? process.env.PORT : "3000"

const authCtrl = require('./controllers/auth')
const usersCtrl = require('./controllers/users')
const productsCtrl = require('./controllers/products')
const ordersCtrl = require('./controllers/orders')

const verifyToken = require('./middleware/verify-token')
const verifyAdmin = require('./middleware/verify-admin')
const upload = require('./middleware/upload')
const uploadImage = require('./middleware/upload-image')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Auth
app.post('/auth/sign-up', authCtrl.signUp)
app.post('/auth/sign-in', authCtrl.signIn)

app.get('/users', verifyToken, usersCtrl.index)

// Products
app.get('/products', productsCtrl.index)
app.get('/products/admin/all', verifyToken, verifyAdmin, productsCtrl.adminIndex)
app.get('/products/:productId', productsCtrl.show)
app.post('/products', verifyToken, verifyAdmin, uploadImage.single('image'), productsCtrl.create)
app.put('/products/:productId', verifyToken, verifyAdmin, uploadImage.single('image'), productsCtrl.update)
app.delete('/products/:productId', verifyToken, verifyAdmin, productsCtrl.remove)

// Orders
app.post('/orders', verifyToken, upload.single('receipt'), ordersCtrl.create)
app.get('/orders/mine', verifyToken, ordersCtrl.mine)
app.get('/orders', verifyToken, verifyAdmin, ordersCtrl.index)
app.put('/orders/:orderId/confirm', verifyToken, verifyAdmin, ordersCtrl.confirm)
app.put('/orders/:orderId/reject', verifyToken, verifyAdmin, ordersCtrl.reject)

// Error handler (upload errors, etc.)
app.use((err, req, res, next) => {
    res.status(400).json({ err: err.message })
})

app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}! 😀`)
})