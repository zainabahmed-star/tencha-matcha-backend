const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')

const PORT = process.env.PORT ? process.env.PORT : "3000"

const authCtrl = require('./controllers/auth')
const usersCtrl = require('./controllers/users')

const verifyToken = require('./middleware/verify-token')

const productsCtrl = require('./controllers/products')
const verifyAdmin = require('./middleware/verify-admin')
const ordersCtrl = require('./controllers/orders')
const upload = require('./middleware/upload')

mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}. 🥭`)
})

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes go here
// app.get('/auth/sign-token', authCtrl.signToken)
// app.get('/auth/verify-token', authCtrl.verifyToken)
app.post('/auth/sign-up', authCtrl.signUp)
app.post('/auth/sign-in', authCtrl.signIn)

app.get('/users', verifyToken, usersCtrl.index)


app.get('/products', productsCtrl.index)
app.get('/products/:productId', productsCtrl.show)
app.post('/products', verifyToken, verifyAdmin, productsCtrl.create)
app.put('/products/:productId', verifyToken, verifyAdmin, productsCtrl.update)
app.delete('/products/:productId', verifyToken, verifyAdmin, productsCtrl.remove)

app.post('/orders', verifyToken, upload.single('receipt'), ordersCtrl.create)
app.get('/orders/mine', verifyToken, ordersCtrl.mine)
app.get('/orders', verifyToken, verifyAdmin, ordersCtrl.index)
app.put('/orders/:orderId/confirm', verifyToken, verifyAdmin, ordersCtrl.confirm)
app.put('/orders/:orderId/reject', verifyToken, verifyAdmin, ordersCtrl.reject)

app.use((err, req, res, next) => {
    res.status(400).json({ err: err.message })
})
app.listen(PORT, () => {
  console.log(`The express app is ready on port ${PORT}! 😀`)
})
