const express = require('express');
const router = express.Router();
const { saveDesign, getDesign, getMyDesigns, uploadRoomImage } = require('../controllers/customizationController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', optionalAuth, upload.single('room_image'), saveDesign);
router.get('/my-designs', protect, getMyDesigns);
router.get('/:id', getDesign);
router.post('/room-image', optionalAuth, upload.single('image'), uploadRoomImage);

module.exports = router;

