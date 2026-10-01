const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const User = require('../models/user')

const makeToken = (user) => {
    const payload = { username: user.username, _id: user._id, role: user.role }
    return jwt.sign({ payload }, process.env.JWT_SECRET)
}

const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ err: 'Username, email and password are required.' })
        }

        const userInDatabase = await User.findOne({
            $or: [{ username }, { email: email.toLowerCase() }]
        })

        if (userInDatabase) {
            return res.status(409).json({ err: 'Username or email already taken.' })
        }

        const hashedPassword = bcrypt.hashSync(password, 10)

        
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        })

        res.status(201).json({ token: makeToken(user) })
    } catch (err) {
        res.status(400).json({ err: err.message })
    }
}

const signIn = async (req, res) => {
    try {
        const userInDatabase = await User.findOne({
            username: req.body.username
        })

        if (!userInDatabase) {
            return res.status(404).json({ err: 'User does not exist.' })
        }

        const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)

        if (!validPassword) {
            return res.status(401).json({ err: 'Login failed. Please try again.' })
        }

        res.status(200).json({ token: makeToken(userInDatabase) })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports = {
    signUp,
    signIn,
}