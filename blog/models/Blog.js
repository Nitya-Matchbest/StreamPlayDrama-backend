const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        required: [true, 'Blog excerpt is required'],
        maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Drama Series', 'Latest Article', 'Entertainment', 'Industry Trends', 'Reviews']
    },
    featuredImage: {
        type: String,
        required: [true, 'Featured image is required']
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    // New format: single rich-HTML body from CKEditor
    body: {
        type: String,
        default: ''
    },
    // Legacy format: array of titled sections (kept for backward compatibility)
    content: [{
        sectionTitle: {
            type: String
        },
        sectionContent: {
            type: String
        }
    }],
    relatedArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DramaBlog'
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'dramablogs'
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
    return this.publishDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Index for search optimization
blogSchema.index({ title: 'text', excerpt: 'text' });
blogSchema.index({ publishDate: -1 });
blogSchema.index({ category: 1 });

module.exports = mongoose.model('DramaBlog', blogSchema);
