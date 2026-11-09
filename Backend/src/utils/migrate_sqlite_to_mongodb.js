require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const CustomDesign = require('../models/CustomDesign');
const Order = require('../models/Order');
const RoomImage = require('../models/RoomImage');

// Direct migration of SQLite data into MongoDB
const SQLITE_DATA = {
  users: [
    {
      sqlite_id: 2,
      name: "Test User",
      email: "test@example.com",
      is_admin: false,
      passwordRaw: "password123"
    },
    {
      sqlite_id: 3,
      name: "saikumar",
      email: "dasettisaikumar@gmail.com",
      is_admin: false,
      passwordRaw: "password123"
    },
    {
      sqlite_id: 4,
      name: "Nandini Gottipati",
      email: "Nandinigottipati2004@gmail.com",
      is_admin: true,
      passwordRaw: "Nandhini@2004"
    },
    {
      sqlite_id: 99,
      name: "System Administrator",
      email: "admin@example.com",
      is_admin: true,
      passwordRaw: "admin123"
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
      shipping_address: "nhmj",
      customer_name: "Test User",
      customer_phone: "89",
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
      shipping_address: "sdfghj",
      customer_name: "System Administrator",
      customer_phone: "2345678909",
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
      shipping_address: "fvr",
      customer_name: "System Administrator",
      customer_phone: "456",
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
  ]
};

const connectDB = require('../config/db');

async function migrate() {
  try {
    await connectDB();

    // 1. Migrate Users
    console.log('\n--- Migrating Users ---');
    const userMap = {}; // email -> doc
    for (const u of SQLITE_DATA.users) {
      let userDoc = await User.findOne({ email: u.email });
      if (!userDoc) {
        userDoc = new User({
          name: u.name,
          email: u.email,
          is_admin: u.is_admin,
          password: u.passwordRaw
        });
        await userDoc.save();
        console.log(`✅ Created User: ${u.email} (${u.is_admin ? 'Admin' : 'Customer'})`);
      } else {
        userDoc.password = u.passwordRaw;
        await userDoc.save();
        console.log(`✅ Reset password for: ${u.email}`);
      }
      userMap[u.email] = userDoc;
    }

    // 2. Fetch products to resolve references
    const lamp = await Product.findOne({ name: 'Artisan Table Lamp' });

    // 3. Migrate Custom Designs
    console.log('\n--- Migrating Custom Designs ---');
    for (const d of SQLITE_DATA.custom_designs) {
      const userDoc = d.user_email ? userMap[d.user_email] : null;
      const count = await CustomDesign.countDocuments({
        'design_json.color': d.design_json.color,
        'design_json.frame_style': d.design_json.frame_style
      });
      if (count === 0 && lamp) {
        await CustomDesign.create({
          user: userDoc ? userDoc._id : null,
          product: lamp._id,
          design_json: d.design_json,
          status: d.status
        });
        console.log(`✅ Migrated Custom Design (${d.design_json.color})`);
      } else {
        console.log(`ℹ️ Custom Design already present or skipped`);
      }
    }

    // 4. Migrate Orders
    console.log('\n--- Migrating Orders ---');
    for (const ord of SQLITE_DATA.orders) {
      const existingOrder = await Order.findOne({ order_number: ord.order_number });
      if (!existingOrder) {
        const userDoc = ord.user_email ? userMap[ord.user_email] : null;
        await Order.create({
          user: userDoc ? userDoc._id : null,
          order_number: ord.order_number,
          total_price: ord.total_price,
          status: ord.status,
          shipping_address: ord.shipping_address,
          customer_name: ord.customer_name,
          customer_phone: ord.customer_phone,
          customer_email: ord.customer_email,
          cart_items: ord.cart_items,
          payment_id: ord.payment_id,
          payment_status: ord.payment_status,
          placed_at: ord.placed_at
        });
        console.log(`✅ Migrated Order: ${ord.order_number} (${ord.status})`);
      } else {
        console.log(`ℹ️ Order already exists: ${ord.order_number}`);
      }
    }

    // Summary counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalDesigns = await CustomDesign.countDocuments();
    const totalOrders = await Order.countDocuments();

    console.log('\n=======================================');
    console.log('🎉 MONGODB MIGRATION COMPLETE SUMMARY:');
    console.log(`  Users in MongoDB:          ${totalUsers}`);
    console.log(`  Products in MongoDB:       ${totalProducts}`);
    console.log(`  Custom Designs in MongoDB: ${totalDesigns}`);
    console.log(`  Orders in MongoDB:         ${totalOrders}`);
    console.log('=======================================\n');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
}

migrate();

