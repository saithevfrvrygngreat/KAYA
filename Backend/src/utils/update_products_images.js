const mongoose = require('mongoose');
const Product = require('../models/Product');

const updates = [
  { name: 'Custom Canvas Wall Art', image_path: '/images/masterpiece/product_canvas.png' },
  { name: 'Personalized Wooden Wall Frame', image_path: '/images/masterpiece/product_frame.png' },
  { name: 'Hexagonal Wooden Wall Mirror', image_path: '/images/masterpiece/product_mirror.png' },
  { name: 'Macramé Wall Hanging', image_path: '/images/masterpiece/product_macrame.png' },
  { name: 'Artisan Table Lamp', image_path: '/images/masterpiece/product_lamp.png' },
  { name: 'Rattan Pendant Shade', image_path: '/images/masterpiece/product_pendant.png' },
  { name: 'Bohemian Fairy String Lights', image_path: '/images/masterpiece/fairy_string_lights.png' },
  { name: 'Personalized Throw Pillow', image_path: '/images/masterpiece/product_pillow.png' },
  { name: 'Custom Cushion Cover Set (2)', image_path: '/images/masterpiece/product_cushions.png' },
  { name: 'Handwoven Knit Throw Blanket', image_path: '/images/masterpiece/product_blanket.png' },
  { name: 'Ceramic Bud Vase Set (3)', image_path: '/images/masterpiece/product_vase.png' },
  { name: 'Luxury Soy Scented Candle', image_path: '/images/masterpiece/product_candle.png' },
  { name: 'Woven Seagrass Storage Tray', image_path: '/images/masterpiece/product_tray.png' },
  { name: 'Natural Jute Area Rug', image_path: '/images/masterpiece/product_jute_rug.png' },
  { name: 'Geometric Dhurrie Rug', image_path: '/images/masterpiece/product_dhurrie_rug.png' }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaya');
    console.log('Connected to MongoDB');
    for (const item of updates) {
      const res = await Product.updateOne({ name: item.name }, { $set: { image_path: item.image_path } });
      console.log(`Updated ${item.name}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    }
    console.log('All 15 product image paths updated to local masterpiece assets successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating product images:', err.message);
    process.exit(1);
  }
}

run();
