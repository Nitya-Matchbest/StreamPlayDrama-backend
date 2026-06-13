const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const path = require('path');

/**
 * Wraps a Buffer as a Readable stream compatible with all Node.js versions.
 */
function bufferToStream(buffer) {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // Signal EOF
    return readable;
}

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
        const filename = 'blog-image-' + uniqueSuffix + path.extname(req.file.originalname).toLowerCase();

        // Upload the file buffer to GridFS using a promise
        const fileId = await new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(filename, {
                contentType: req.file.mimetype,
                metadata: {
                    originalname: req.file.originalname,
                    uploadedAt: new Date()
                }
            });

            uploadStream.on('finish', () => resolve(uploadStream.id));
            uploadStream.on('error', reject);

            // Write the buffer directly — most reliable across all Node versions
            uploadStream.end(req.file.buffer);
        });

        const fileUrl = `/api/image/${fileId}`;

        return res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: filename,
                url: fileUrl,
                id: fileId,
                size: req.file.size
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
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
        res.set('Content-Type', file.contentType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000');

        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error streaming image' });
            }
        });

    } catch (error) {
        console.error('Error fetching image:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching image',
            error: error.message
        });
    }
};
