require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const CustomDesign = require('../models/CustomDesign');
const Order = require('../models/Order');
const RoomImage = require('../models/RoomImage');
const connectDB = require('../config/db');

// Exact data from original SQLite database
const SQLITE_DATA = {
  users: [
    {
      name: "Test User",
      email: "test@example.com",
      is_admin: false,
      passwordRaw: "password123"
    },
    {
      name: "saikumar",
      email: "dasettisaikumar@gmail.com",
      is_admin: false,
      passwordRaw: "password123"
    },
    {
      name: "Nandini Gottipati",
      email: "Nandinigottipati2004@gmail.com",
      is_admin: true,
      passwordRaw: "Nandhini@2004"
    },
    {
      name: "System Administrator",
      email: "admin@example.com",
      is_admin: false,
      passwordRaw: "admin123"
    }
  ],
  products: [
    // Wall Decor
    {
      name: 'Custom Canvas Wall Art',
      description: 'AI-generated personalized canvas print with your chosen palette, quote, and abstract composition. Printed on premium 400gsm cotton rag.',
      category: 'Wall Decor',
      base_price: 2199.00,
      image_path: '/images/masterpiece/product_canvas.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Personalized Wooden Wall Frame',
      description: 'Handcrafted solid wood frame with your custom text, initials, or a special date. Available in Oak, Walnut, and Ebony finishes.',
      category: 'Wall Decor',
      base_price: 1499.00,
      image_path: '/images/masterpiece/product_frame.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Hexagonal Wooden Wall Mirror',
      description: 'A geometric statement mirror in hand-finished teak. Clusters beautifully into a gallery wall arrangement.',
      category: 'Wall Decor',
      base_price: 2799.00,
      image_path: '/images/masterpiece/product_mirror.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Macramé Wall Hanging',
      description: 'Hand-knotted from natural cotton rope. Customizable in width, fringe length, and accent bead color. Bohemian & Japandi ready.',
      category: 'Wall Decor',
      base_price: 1299.00,
      image_path: '/images/masterpiece/product_macrame.png',
      is_active: true,
      in_stock: true
    },
    // Lighting
    {
      name: 'Artisan Table Lamp',
      description: 'Sculpted ceramic base with a linen drum shade. Available in 6 glaze colors to match your room palette. Warm 2700K Edison bulb included.',
      category: 'Lighting',
      base_price: 3499.00,
      image_path: '/images/masterpiece/product_lamp.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Rattan Pendant Shade',
      description: 'Hand-woven rattan pendant that casts stunning dappled light patterns. Ideal above dining tables and reading nooks.',
      category: 'Lighting',
      base_price: 2199.00,
      image_path: '/images/masterpiece/product_pendant.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Bohemian Fairy String Lights',
      description: 'Warm-white micro-LED string lights on copper wire, 5 metres. Perfect for headboards, shelves, and balcony draping.',
      category: 'Lighting',
      base_price: 899.00,
      image_path: '/images/masterpiece/fairy_string_lights.png',
      is_active: true,
      in_stock: true
    },
    // Soft Furnishings
    {
      name: 'Personalized Throw Pillow',
      description: 'Custom monogram or quote embroidered on 100% organic Belgian linen. Stone-washed for a lived-in luxury feel. 45 × 45 cm.',
      category: 'Soft Furnishings',
      base_price: 899.00,
      image_path: '/images/masterpiece/product_pillow.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Custom Cushion Cover Set (2)',
      description: 'Pair of cushion covers in coordinating prints. Choose from our AI-curated fabric palettes — Japandi, Boho, or Minimalist.',
      category: 'Soft Furnishings',
      base_price: 1199.00,
      image_path: '/images/masterpiece/product_cushions.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Handwoven Knit Throw Blanket',
      description: 'Chunky-knit merino-blend throw in your chosen colorway. Drapes beautifully over sofas and armchairs for a cosy, editorial look.',
      category: 'Soft Furnishings',
      base_price: 2499.00,
      image_path: '/images/masterpiece/product_blanket.png',
      is_active: true,
      in_stock: true
    },
    // Decorative Accents
    {
      name: 'Ceramic Bud Vase Set (3)',
      description: 'A trio of hand-thrown stoneware vases in graduated heights. Each set is unique — glazed in earthy matte finishes that complement any palette.',
      category: 'Decorative Accents',
      base_price: 1199.00,
      image_path: '/images/masterpiece/product_vase.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Luxury Soy Scented Candle',
      description: 'Hand-poured soy wax in a reusable ceramic pot. Choose from 8 signature scents: Vetiver & Cedar, White Tea, Jasmine Noir, and more.',
      category: 'Decorative Accents',
      base_price: 699.00,
      image_path: '/images/masterpiece/product_candle.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Woven Seagrass Storage Tray',
      description: 'Natural seagrass tray with leather handles. Perfect as a coffee table centrepiece, catch-all, or plant display plinth.',
      category: 'Decorative Accents',
      base_price: 1099.00,
      image_path: '/images/masterpiece/product_tray.png',
      is_active: true,
      in_stock: true
    },
    // Rugs & Mats
    {
      name: 'Natural Jute Area Rug',
      description: 'Hand-braided jute rug with a dense, durable weave. Earthy, natural texture grounds any room. Custom sizes from 3×5 to 8×10 ft.',
      category: 'Rugs & Mats',
      base_price: 4999.00,
      image_path: '/images/masterpiece/product_jute_rug.png',
      is_active: true,
      in_stock: true
    },
    {
      name: 'Geometric Dhurrie Rug',
      description: 'Flatweave cotton dhurrie in bold or subtle geometric patterns. Reversible, easy-clean, and available in 12 colorways.',
      category: 'Rugs & Mats',
      base_price: 5499.00,
      image_path: '/images/masterpiece/product_dhurrie_rug.png',
      is_active: true,
      in_stock: true
    }
  ],
  custom_designs: [
    {
      user_email: "test@example.com",
      product_name: "Artisan Table Lamp",
      design_json: {
        color: "#064e3b",
        size: "A3",
        scale: 100,
        frame_style: "black",
        ai_art_spec: null,
        backdrop: "living",
        offset_x: 300,
        offset_y: 120,
        frame_w: 160,
        frame_h: 240,
        product_category: "Lighting"
      },
      status: "saved"
    },
    {
      user_email: null,
      product_name: "Artisan Table Lamp",
      design_json: {
        color: "#1e3a8a",
        size: "A3",
        scale: 100,
        frame_style: "oak",
        ai_art_spec: null,
        backdrop: "living",
        offset_x: 52.176828526027805,
        offset_y: 52.70294484944574,
        frame_w: 160,
        frame_h: 240,
        product_category: "Lighting"
      },
      status: "saved"
    }
  ],
  orders: [
    {
      user_email: "test@example.com",
      order_number: "ORD-20260520-LBKVP5",
      total_price: 1060.82,
      status: "delivered",
      shipping_address: "124 Park Lane, Bangalore",
      customer_name: "Test User",
      customer_phone: "9876543210",
      customer_email: "test@example.com",
      cart_items: [
        {
          id: "7",
          name: "Bohemian Fairy String Lights",
          price: 899,
          style: "Signature Collective",
          qty: 1,
          image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=700&q=80"
        }
      ],
      payment_id: "pay_q3ejhukwro6o26",
      payment_status: "paid",
      placed_at: new Date("2026-05-20T05:50:03Z")
    },
    {
      user_email: null,
      order_number: "ORD-20260521-ZCNJJ7",
      total_price: 1060.82,
      status: "processing",
      shipping_address: "Suite 404, Regency Tower, Mumbai",
      customer_name: "System Administrator",
      customer_phone: "9988776655",
      customer_email: "admin@example.com",
      cart_items: [
        {
          id: "7",
          name: "Bohemian Fairy String Lights",
          price: 899,
          style: "Signature Collective",
          qty: 1,
          image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80"
        }
      ],
      payment_id: "pay_7y0nrg5knft7lm",
      payment_status: "paid",
      placed_at: new Date("2026-05-21T20:12:07Z")
    },
    {
      user_email: null,
      order_number: "ORD-20260521-XGIXJO",
      total_price: 1060.82,
      status: "placed",
      shipping_address: "Villa 12, Palm Meadows, Hyderabad",
      customer_name: "System Administrator",
      customer_phone: "9876501234",
      customer_email: "admin@example.com",
      cart_items: [
        {
          id: "7",
          name: "Bohemian Fairy String Lights",
          price: 899,
          style: "Signature Collective",
          qty: 1,
          image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80"
        }
      ],
      payment_id: "pay_0o4w8dtyaeap30",
      payment_status: "paid",
      placed_at: new Date("2026-05-21T20:38:09Z")
    }
  ],
  room_images: [
    {
      user_email: "test@example.com",
      path: "/uploads/rooms/sample-living-room.jpg"
    }
  ]
};

async function seedAll(cleanExisting = false) {
  try {
    await connectDB();
    console.log('🍃 Seeding Master Data from original SQLite into MongoDB (kaya_db)...');

    if (cleanExisting) {
      console.log('🧹 Clearing old collections...');
      await User.deleteMany({});
      await Product.deleteMany({});
      await CustomDesign.deleteMany({});
      await Order.deleteMany({});
      await RoomImage.deleteMany({});
    }

    // 1. Products
    console.log('\n--- 1. Seeding Products ---');
    const productMap = {};
    for (const p of SQLITE_DATA.products) {
      const prod = await Product.findOneAndUpdate(
        { name: p.name },
        p,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      productMap[p.name] = prod;
    }
    console.log(`✅ Loaded ${Object.keys(productMap).length} Products.`);

    // 2. Users
    console.log('\n--- 2. Seeding Users ---');
    const userMap = {};
    for (const u of SQLITE_DATA.users) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User({
          name: u.name,
          email: u.email,
          is_admin: u.is_admin,
          password: u.passwordRaw
        });
        await user.save();
        console.log(`✅ Created User: ${u.email} (${u.is_admin ? 'Admin' : 'Customer'})`);
      } else {
        user.password = u.passwordRaw;
        user.is_admin = u.is_admin;
        user.name = u.name;
        await user.save();
        console.log(`✅ Synchronized User: ${u.email}`);
      }
      userMap[u.email] = user;
    }

    // 3. Custom Designs
    console.log('\n--- 3. Seeding Custom Designs ---');
    for (const d of SQLITE_DATA.custom_designs) {
      const user = d.user_email ? userMap[d.user_email] : null;
      const product = productMap[d.product_name] || await Product.findOne({ name: d.product_name });
      if (product) {
        const count = await CustomDesign.countDocuments({
          'design_json.color': d.design_json.color,
          'design_json.frame_style': d.design_json.frame_style
        });
        if (count === 0) {
          await CustomDesign.create({
            user: user ? user._id : null,
            product: product._id,
            design_json: d.design_json,
            status: d.status
          });
          console.log(`✅ Seeded Custom Design: ${d.design_json.color}`);
        }
      }
    }

    // 4. Orders
    console.log('\n--- 4. Seeding Orders ---');
    for (const ord of SQLITE_DATA.orders) {
      const user = ord.user_email ? userMap[ord.user_email] : null;
      await Order.findOneAndUpdate(
        { order_number: ord.order_number },
        {
          ...ord,
          user: user ? user._id : null
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ Synchronized Order: ${ord.order_number}`);
    }

    // 5. Room Images
    console.log('\n--- 5. Seeding Room Images ---');
    for (const r of SQLITE_DATA.room_images) {
      const user = r.user_email ? userMap[r.user_email] : null;
      await RoomImage.findOneAndUpdate(
        { path: r.path },
        { path: r.path, user: user ? user._id : null },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Seeded Room Image.`);

    // Verification Counts
    const counts = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      customdesigns: await CustomDesign.countDocuments(),
      orders: await Order.countDocuments(),
      roomimages: await RoomImage.countDocuments()
    };

    console.log('\n======================================================');
    console.log('🎉 ALL SQLITE DATA SUCCESSFULLY MIGRATED TO MONGODB:');
    console.log(`   users:         ${counts.users}`);
    console.log(`   products:      ${counts.products}`);
    console.log(`   customdesigns: ${counts.customdesigns}`);
    console.log(`   orders:        ${counts.orders}`);
    console.log(`   roomimages:    ${counts.roomimages}`);
    console.log('======================================================\n');

    return counts;
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  }
}

if (require.main === module) {
  seedAll(false).then(() => {
    mongoose.disconnect();
    process.exit(0);
  }).catch(() => {
    mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = seedAll;

