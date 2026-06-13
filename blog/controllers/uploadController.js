const Image = require('../models/Image');

// Upload image — saves binary data directly to MongoDB (no GridFS)
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const image = await Image.create({
            filename:    req.file.originalname,
            contentType: req.file.mimetype,
            data:        req.file.buffer,
            size:        req.file.size
        });

        const fileUrl = `/api/image/${image._id}`;

        return res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: image.filename,
                url:      fileUrl,
                id:       image._id,
                size:     image.size
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

// Get image by MongoDB _id — returns raw image bytes
exports.getImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.set('Content-Type', image.contentType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000');
        return res.send(image.data);

    } catch (error) {
        console.error('Error fetching image:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching image',
            error: error.message
        });
    }
};
