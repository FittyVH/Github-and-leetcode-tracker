const jwt = require('jsonwebtoken')

async function authUser(req, res, next){
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." })
    }

    try {
        // If this verification fails, it immediately throws an error and drops to catch()
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        
        // Everything is valid, proceed safely
        next()
    } catch (err) {
        // FIX: Log the error on your server side for debugging
        console.error("JWT Verification Error:", err.message)
        
        // FIX: Inform the client's browser so the request finishes loading with an error status
        return res.status(403).json({ message: "Invalid or expired token" })
    }
}

module.exports = {authUser}