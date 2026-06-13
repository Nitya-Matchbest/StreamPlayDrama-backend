const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const path = require('path');

// Upload image — streams buffer from multer memory storage into MongoDB GridFS
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const db = mongoose.connection.db;
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database not connected'
            });
        }

        const bucket = new GridFSBucket(db, { bucketName: 'blogImages' });

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = 'blog-image-' + uniqueSuffix + path.extname(req.file.originalname);

        // Convert buffer to readable stream and upload to GridFS
        const readableStream = Readable.from(req.file.buffer);
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: req.file.mimetype
        });

        readableStream.pipe(uploadStream);

        uploadStream.on('error', (err) => {
            console.error('GridFS upload error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error saving image to database',
                    error: err.message
                });
            }
        });

        uploadStream.on('finish', () => {
            const fileId = uploadStream.id;
            const fileUrl = `/api/image/${fileId}`;

            res.json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    filename: filename,
                    url: fileUrl,
                    id: fileId,
                    size: req.file.size
                }
            });
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};

// Get image by GridFS ObjectId — streams image from MongoDB
exports.getImage = async (req, res) => {
    try {
        const fileId = req.params.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image ID'
            });
        }

        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'blogImages' });

        const objectId = new mongoose.Types.ObjectId(fileId);

        // Check the file exists in GridFS
        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const file = files[0];

        // Set proper content-type header
        res.set('Content-Type', file.contentType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000'); // cache 1 year

        // Stream image from GridFS to response
        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error streaming image'
                });
            }
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching image',
            error: error.message
        });
    }
};
