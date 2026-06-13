const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../config/multer');

// Upload image — saves to MongoDB GridFS
router.post('/', upload.single('image'), uploadController.uploadImage);

// Get image by GridFS ObjectId
router.get('/:id', uploadController.getImage);

module.exports = router;
