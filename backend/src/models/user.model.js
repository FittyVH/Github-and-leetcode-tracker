const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
    },
    avatarUrl: { type: String }
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel