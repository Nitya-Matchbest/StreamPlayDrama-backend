const Blog = require('../models/Blog');

// Get all blogs (with pagination and filters)
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 9, category, search } = req.query;
        
        const query = { isPublished: true };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$text = { $search: search };
        }
        
        const blogs = await Blog.find(query)
            .sort({ publishDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-content -body')
            .lean();
        
        const count = await Blog.countDocuments(query);
        
        res.json({
            success: true,
            data: blogs,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

// Get single blog by ID (for admin panel)
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
};

// Get single blog by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            slug: req.params.slug,
            isPublished: true 
        }).populate('relatedArticles', 'title slug excerpt featuredImage publishDate category');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        // Increment view count
        blog.views += 1;
        await blog.save();
        
        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
};

// Create new blog
exports.createBlog = async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        
        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        
        // Handle duplicate slug error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
            return res.status(400).json({
                success: false,
                message: 'A blog with this title already exists. Please use a different title.',
                error: 'Duplicate title'
            });
        }
        
        res.status(400).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        // If title is changing, regenerate slug
        const updateData = { ...req.body };
        if (updateData.title) {
            const slugify = require('slugify');
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Blog updated successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
};

// Get categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Blog.distinct('category', { isPublished: true });
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};
