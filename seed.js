require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('./models/user')
const Product = require('./models/product')

const products = [
    {
        name: 'China Premium Matcha',
        origin: 'China',
        category: 'Matcha',
        description: 'Premium matcha powder from China. (Placeholder description)',
        image: '',
        variants: [
            { size: '30g', price: 5.5, stock: 20 },
            { size: '50g', price: 7.5, stock: 20 },
            { size: '100g', price: 12.5, stock: 20 },
        ],
    },
    {
        name: 'Samidori',
        origin: 'Uji, Kyoto, Japan',
        category: 'Matcha',
        description: 'Matcha powder from Uji, Kyoto, Japan. (Placeholder description)',
        image: '',
        variants: [
            { size: '30g', price: 8, stock: 20 },
            { size: '50g', price: 11, stock: 20 },
            { size: '100g', price: 19, stock: 20 },
        ],
    },
]

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to', mongoose.connection.name)

        // admin account: created once, or promoted if the email already exists
        const email = process.env.ADMIN_EMAIL.toLowerCase()
        const existing = await User.findOne({ email })

        if (existing) {
            existing.role = 'admin'
            await existing.save()
            console.log('Existing user promoted to admin:', email)
        } else {
            await User.create({
                username: process.env.ADMIN_USERNAME,
                email,
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
                role: 'admin',
            })
            console.log('Admin created:', email)
        }

        // products: replaces ALL existing products, for development only
        await Product.deleteMany({})
        await Product.insertMany(products)
        console.log(`Seeded ${products.length} products`)
    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.disconnect()
    }
}

seed()