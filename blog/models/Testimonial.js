const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Reviewer name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    company: {
        type: String,
        required: [true, 'Company/Network is required'],
        trim: true,
        maxlength: [150, 'Company cannot exceed 150 characters']
    },
    text: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true,
        maxlength: [1000, 'Review text cannot exceed 1000 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5,
        default: 5
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: [true, 'Reviewer image is required']
    }
}, {
    timestamps: true,
    collection: 'dramatestimonials'
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
