const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../config/multer');

// Upload image
router.post('/', upload.single('image'), uploadController.uploadImage);

// Get image
router.get('/:filename', uploadController.getImage);

module.exports = router;
