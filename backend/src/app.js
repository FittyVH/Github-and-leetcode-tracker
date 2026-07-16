const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes.js')
const groupRoutes = require('./routes/group.routes.js')

const app = express()

// middleware
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173", // Allows your Vite React app to connect
    credentials: true,                // Allows cookies (JWT token) to be sent over cross-origin
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/group', groupRoutes)

module.exports = app