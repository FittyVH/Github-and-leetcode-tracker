const mongoose = require('mongoose')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_DB_CLUSTER)
        console.log("Connected to db")

    } catch (err) {
        console.log("Connection to db failed")
        console.error(err)
    }
}

module.exports = connectDB