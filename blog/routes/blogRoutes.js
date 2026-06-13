const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Get all blogs
router.get('/', blogController.getAllBlogs);

// Get blog by ID (for admin)
router.get('/id/:id', blogController.getBlogById);

// Get blog by slug
router.get('/slug/:slug', blogController.getBlogBySlug);

// Get categories
router.get('/categories', blogController.getCategories);

// Create new blog
router.post('/', blogController.createBlog);

// Update blog
router.put('/:id', blogController.updateBlog);

// Delete blog
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
