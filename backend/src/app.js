const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes.js')
const groupRoutes = require('./routes/group.routes.js')

const app = express()

// middleware
app.use(express.json())
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173"
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(null, true); // flexible fallback
    },
    credentials: true,                // Allows cookies (JWT token) to be sent over cross-origin
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/group', groupRoutes)

module.exports = app