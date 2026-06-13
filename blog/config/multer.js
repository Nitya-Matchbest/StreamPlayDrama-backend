const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
require('dotenv').config();

// Configure GridFS storage — saves directly to MongoDB
const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);

            if (!mimetype || !extname) {
                return reject(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const filename = 'blog-image-' + uniqueSuffix + path.extname(file.originalname);

            resolve({
                bucketName: 'blogImages', // GridFS bucket name
                filename: filename
            });
        });
    }
});

// Configure multer with GridFS storage
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
