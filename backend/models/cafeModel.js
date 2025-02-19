const mongoose = require('mongoose')

const cafeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("Cafe", cafeSchema)