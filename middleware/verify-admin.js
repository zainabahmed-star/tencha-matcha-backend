const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next()
    }
    res.status(403).json({ err: 'Admin access only.' })
}

module.exports = verifyAdmin