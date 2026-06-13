const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./blog/config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (Same database as StreamPlay)
connectDB();

// Routes
const blogRoutes = require('./blog/routes/blogRoutes');
const uploadRoutes = require('./blog/routes/uploadRoutes');

app.use('/api/blogs', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/image', uploadRoutes);

// Root route - Welcome page
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎬 Welcome to Drama Platform Blog API',
        version: '1.0.0',
        endpoints: {
            adminPanel: 'http://localhost:' + PORT + '/admin.html',
            getAllBlogs: 'http://localhost:' + PORT + '/api/blogs',
            healthCheck: 'http://localhost:' + PORT + '/api/health',
            apiDocs: 'http://localhost:' + PORT + '/api/blogs'
        },
        database: {
            status: 'connected',
            host: '43.205.217.221:27030',
            database: 'streamplay',
            collection: 'dramablogs'
        },
        documentation: 'See README.md for complete API documentation'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Drama Platform Blog API is running',
        database: {
            host: '43.205.217.221:27030',
            database: 'streamplay',
            collection: 'dramablogs'
        },
        adminPanel: 'http://localhost:' + PORT + '/admin.html',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Drama Backend Server is running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/blogs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log('=================================');
});
