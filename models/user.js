const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
}, { timestamps: true })

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.password
    }
})

const User = mongoose.model('User', userSchema)
module.exports = User