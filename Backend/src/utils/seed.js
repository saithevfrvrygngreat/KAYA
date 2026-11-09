require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const PRODUCTS = [
  // ─── Wall Decor ───────────────────────────────────────────────
  { name: 'Custom Canvas Wall Art', description: 'AI-generated personalized canvas print with your chosen palette, quote, and abstract composition. Printed on premium 400gsm cotton rag.', category: 'Wall Decor', base_price: 2199.00, image_path: '/images/masterpiece/product_canvas.png', is_active: true, in_stock: true },
  { name: 'Personalized Wooden Wall Frame', description: 'Handcrafted solid wood frame with your custom text, initials, or a special date. Available in Oak, Walnut, and Ebony finishes.', category: 'Wall Decor', base_price: 1499.00, image_path: '/images/masterpiece/product_frame.png', is_active: true, in_stock: true },
  { name: 'Hexagonal Wooden Wall Mirror', description: 'A geometric statement mirror in hand-finished teak. Clusters beautifully into a gallery wall arrangement.', category: 'Wall Decor', base_price: 2799.00, image_path: '/images/masterpiece/product_mirror.png', is_active: true, in_stock: true },
  { name: 'Macramé Wall Hanging', description: 'Hand-knotted from natural cotton rope. Customizable in width, fringe length, and accent bead color. Bohemian & Japandi ready.', category: 'Wall Decor', base_price: 1299.00, image_path: '/images/masterpiece/product_macrame.png', is_active: true, in_stock: true },
  // ─── Lighting ─────────────────────────────────────────────────
  { name: 'Artisan Table Lamp', description: 'Sculpted ceramic base with a linen drum shade. Available in 6 glaze colors to match your room palette. Warm 2700K Edison bulb included.', category: 'Lighting', base_price: 3499.00, image_path: '/images/masterpiece/product_lamp.png', is_active: true, in_stock: true },
  { name: 'Rattan Pendant Shade', description: 'Hand-woven rattan pendant that casts stunning dappled light patterns. Ideal above dining tables and reading nooks.', category: 'Lighting', base_price: 2199.00, image_path: '/images/masterpiece/product_pendant.png', is_active: true, in_stock: true },
  { name: 'Bohemian Fairy String Lights', description: 'Warm-white micro-LED string lights on copper wire, 5 metres. Perfect for headboards, shelves, and balcony draping.', category: 'Lighting', base_price: 899.00, image_path: '/images/masterpiece/fairy_string_lights.png', is_active: true, in_stock: true },
  // ─── Soft Furnishings ─────────────────────────────────────────
  { name: 'Personalized Throw Pillow', description: 'Custom monogram or quote embroidered on 100% organic Belgian linen. Stone-washed for a lived-in luxury feel. 45 × 45 cm.', category: 'Soft Furnishings', base_price: 899.00, image_path: '/images/masterpiece/product_pillow.png', is_active: true, in_stock: true },
  { name: 'Custom Cushion Cover Set (2)', description: 'Pair of cushion covers in coordinating prints. Choose from our AI-curated fabric palettes — Japandi, Boho, or Minimalist.', category: 'Soft Furnishings', base_price: 1199.00, image_path: '/images/masterpiece/product_cushions.png', is_active: true, in_stock: true },
  { name: 'Handwoven Knit Throw Blanket', description: 'Chunky-knit merino-blend throw in your chosen colorway. Drapes beautifully over sofas and armchairs for a cosy, editorial look.', category: 'Soft Furnishings', base_price: 2499.00, image_path: '/images/masterpiece/product_blanket.png', is_active: true, in_stock: true },
  // ─── Decorative Accents ───────────────────────────────────────
  { name: 'Ceramic Bud Vase Set (3)', description: 'A trio of hand-thrown stoneware vases in graduated heights. Each set is unique — glazed in earthy matte finishes that complement any palette.', category: 'Decorative Accents', base_price: 1199.00, image_path: '/images/masterpiece/product_vase.png', is_active: true, in_stock: true },
  { name: 'Luxury Soy Scented Candle', description: 'Hand-poured soy wax in a reusable ceramic pot. Choose from 8 signature scents: Vetiver & Cedar, White Tea, Jasmine Noir, and more.', category: 'Decorative Accents', base_price: 699.00, image_path: '/images/masterpiece/product_candle.png', is_active: true, in_stock: true },
  { name: 'Woven Seagrass Storage Tray', description: 'Natural seagrass tray with leather handles. Perfect as a coffee table centrepiece, catch-all, or plant display plinth.', category: 'Decorative Accents', base_price: 1099.00, image_path: '/images/masterpiece/product_tray.png', is_active: true, in_stock: true },
  // ─── Rugs & Mats ──────────────────────────────────────────────
  { name: 'Natural Jute Area Rug', description: 'Hand-braided jute rug with a dense, durable weave. Earthy, natural texture grounds any room. Custom sizes from 3×5 to 8×10 ft.', category: 'Rugs & Mats', base_price: 4999.00, image_path: '/images/masterpiece/product_jute_rug.png', is_active: true, in_stock: true },
  { name: 'Geometric Dhurrie Rug', description: 'Flatweave cotton dhurrie in bold or subtle geometric patterns. Reversible, easy-clean, and available in 12 colorways.', category: 'Rugs & Mats', base_price: 5499.00, image_path: '/images/masterpiece/product_dhurrie_rug.png', is_active: true, in_stock: true },
];

const connectDB = require('../config/db');

async function seed() {
  try {
    await connectDB();

    // Upsert each product by name
    for (const p of PRODUCTS) {
      await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
    }
    console.log(`✅ Seeded ${PRODUCTS.length} products successfully`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

