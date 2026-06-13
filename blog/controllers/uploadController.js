const path = require('path');
const fs = require('fs');

// Upload image
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Return the file URL path
        const fileUrl = `/api/image/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                url: fileUrl,
                path: req.file.path,
                size: req.file.size
            }
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

// Get image
exports.getImage = async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../../public/uploads/blog', filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
        
        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching image',
            error: error.message
        });
    }
};
