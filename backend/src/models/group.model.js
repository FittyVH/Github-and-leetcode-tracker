const mongoose = require("mongoose")

const groupSchema = new mongoose.Schema({
    name : {type: String, required: true},
    members : [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}], // the exact name of the user model goes inside ref
    creator: {type: mongoose.Schema.Types.ObjectId, required: true}
})

const groupModel = mongoose.model('group', groupSchema)

module.exports = groupModel