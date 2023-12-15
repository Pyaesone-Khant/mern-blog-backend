const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: String,
    type: String,
    data : Buffer,
})

module.exports = mongoose.model('Image', imageSchema);