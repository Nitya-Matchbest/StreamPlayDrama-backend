const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./blog/config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS — allow Vercel frontends and local dev
const allowedOrigins = [
    'https://streamplaydrama-frontend.vercel.app',
    'https://streamplaydrama-admin.vercel.app',
    // allow any vercel.app subdomain for preview deploys
    /\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5500',
    'null' // file:// local testing
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Render health checks)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.some(o =>
                typeof o === 'string' ? o === origin : o.test(origin)
            )
        ) {
            return callback(null, true);
        }
        // Allow all origins in development
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static public files (not uploads — images are now in MongoDB)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// Routes
const blogRoutes = require('./blog/routes/blogRoutes');
const uploadRoutes = require('./blog/routes/uploadRoutes');
const testimonialRoutes = require('./blog/routes/testimonialRoutes');
const authRoutes = require('./blog/routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/image', uploadRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎬 Welcome to Drama Platform Blog API',
        version: '1.0.0',
        endpoints: {
            getAllBlogs: '/api/blogs',
            uploadImage: 'POST /api/upload',
            getImage: 'GET /api/image/:id',
            healthCheck: '/api/health'
        },
        database: {
            status: 'connected',
            collection: 'dramablogs',
            imageStorage: 'MongoDB GridFS (blogImages bucket)'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Drama Platform Blog API is running',
        imageStorage: 'MongoDB GridFS',
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
    console.log(`📸 Image storage: MongoDB GridFS`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log('=================================');
});
