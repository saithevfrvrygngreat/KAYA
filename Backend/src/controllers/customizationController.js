const mongoose = require('mongoose');
const CustomDesign = require('../models/CustomDesign');
const RoomImage = require('../models/RoomImage');
const Product = require('../models/Product');
const path = require('path');

// POST /api/designs — save a design
const saveDesign = async (req, res) => {
  try {
    const { product_id, design_json } = req.body;

    if (!product_id) {
      return res.status(422).json({ message: 'Validation failed', errors: { product_id: 'Product is required.' } });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(422).json({ message: 'Validation failed', errors: { product_id: 'Invalid product.' } });
    }

    let designData;
    try {
      designData = typeof design_json === 'string' ? JSON.parse(design_json) : design_json;
    } catch {
      return res.status(422).json({ message: 'Validation failed', errors: { design_json: 'Design payload must be a valid object.' } });
    }

    if (!designData || typeof designData !== 'object') {
      return res.status(422).json({ message: 'Invalid design payload.' });
    }

    let roomImagePath = null;
    if (req.file) {
      roomImagePath = 'rooms/' + req.file.filename;
      await RoomImage.create({
        user: req.user ? req.user._id : null,
        path: roomImagePath,
      });
    }

    const design = await CustomDesign.create({
      user: req.user ? req.user._id : null,
      product: product._id,
      design_json: designData,
      room_image_path: roomImagePath,
      status: 'saved',
    });

    res.status(201).json({
      status: 'saved',
      design_id: design._id,
      preview_url: `/designs/${design._id}/preview`,
    });
  } catch (err) {
    console.error('Save design error:', err);
    res.status(500).json({ message: 'Failed to save design.' });
  }
};

// GET /api/designs/my-designs — get current user's designs
const getMyDesigns = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
    const designs = await CustomDesign.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });
    res.json({ data: designs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch designs.' });
  }
};

// GET /api/designs/:id — get design with product
const getDesign = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Design not found.' });
    }
    const design = await CustomDesign.findById(req.params.id).populate('product');
    if (!design) return res.status(404).json({ message: 'Design not found.' });
    res.json({ data: design });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch design.' });
  }
};

// POST /api/designs/room-image — upload room image only
const uploadRoomImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(422).json({ message: 'Image file is required.' });
    }
    const imagePath = 'rooms/' + req.file.filename;
    const roomImage = await RoomImage.create({
      user: req.user ? req.user._id : null,
      path: imagePath,
    });
    res.status(201).json({
      status: 'uploaded',
      room_image_id: roomImage._id,
      image_path: imagePath,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image.' });
  }
};

module.exports = { saveDesign, getDesign, getMyDesigns, uploadRoomImage };

