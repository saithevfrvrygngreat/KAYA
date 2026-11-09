const express = require('express');
const router = express.Router();
const { generateArtSpec, analyzeRoom } = require('../controllers/aiController');
const upload = require('../middleware/upload');

const uploadFlexible = (req, res, next) => {
  upload.fields([
    { name: 'custom_image', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      req.file = req.files['custom_image']?.[0] || req.files['image']?.[0];
    }
    next();
  });
};

router.post('/generate-art', generateArtSpec);
router.post('/analyze-room', uploadFlexible, analyzeRoom);

module.exports = router;
