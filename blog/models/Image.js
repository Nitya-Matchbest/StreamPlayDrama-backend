const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    filename:    { type: String, required: true },
    contentType: { type: String, required: true },
    data:        { type: Buffer, required: true },
    size:        { type: Number },
    uploadedAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', ImageSchema);
