const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./src/app')
const connectDB = require('./src/db/db.js')
require('dotenv').config();

connectDB()

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})