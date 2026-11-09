# 🏺 KAYA — Online Personalized Home Décor Store (MERN Stack)

[![MongoDB](https://img.shields.io/badge/MongoDB-v8.x-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.x-black?style=flat-square&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5.x-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

**KAYA** has been completely migrated from **Laravel (PHP) + SQL** to the full **MERN stack (MongoDB, Express.js, React.js, Node.js)**. 100% of the original luxury design aesthetic, features, workflows, and business logic have been preserved, with zero runtime dependency on PHP, Laravel, or SQLite.

> 🎓 **NoSQL Project Presentation & Viva Package:**
> A complete presentation script, slide-by-slide guide, ER diagrams, and **25 in-depth NoSQL viva questions & answers** are available in [**`MONGODB_README.md`**](MONGODB_README.md).
>
> 🔐 **Authentication, Validation & Exceptions Guide:**
> Detailed documentation of JWT auth, multi-tier validation (React, Express, Mongoose), and application exception handling is available in [**`AUTH_VALIDATION_EXCEPTIONS_README.md`**](AUTH_VALIDATION_EXCEPTIONS_README.md).

---

## 🎓 NoSQL Project Presentation & Viva Highlights

If you are presenting this project for a **NoSQL / Database Systems** viva, the key architectural highlights to present are:

1. **Relational-to-Document Migration:** Migrated from rigid SQL tables to MongoDB BSON documents, enabling schema flexibility for dynamic 3D canvas customization states (`design_json`).
2. **Hybrid Data Modeling Strategy:**
   - **Referenced (`ref`):** Used between `User` and `Order` to prevent document bloat beyond the 16MB limit.
   - **Embedded (Snapshot Pattern):** Used for `Order.cart_items` to guarantee historical immutability of prices and purchased item configurations.
3. **MongoDB Aggregation Pipelines:** Replaced relational `JOIN` and `GROUP BY` with multi-stage `$match` and `$group` aggregations in [`adminController.js`](server/src/controllers/adminController.js) to compute real-time sales revenue and customer metrics.
4. **WiredTiger Storage Engine:** Snappy block compression, B-tree indexes (`email`, `order_number`), and document-level concurrency control in `.mongodb_data/db/`.
5. **Auto-Healing Daemon Connection:** Zero-configuration bootloader in `run-dev.js` and `db.js` that detects MongoDB, cleans stale `mongod.lock` files, and enforces IPv4 (`family: 4`) connectivity.

👉 **Read the full 25 Viva Questions & Answers in [MONGODB_README.md](MONGODB_README.md)**

---

## 🏛️ Migrated Technology Architecture

```
KAYA-main/
├── client/                     # React.js + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── context/AuthContext.jsx    # Persistent JWT Auth State
│   │   ├── services/api.js            # Axios with Bearer Interceptor & /api Proxy
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx          # Pull-chain Theme Toggle, Cart Counter, Drawer, Concierge
│   │   │   └── AdminLayout.jsx        # Administrative Shell
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Ken Burns Hero Slider, Flipboard, Aesthetic Quiz
│   │   │   ├── ProductsPage.jsx       # Artisan Catalog & Quick-view Modals
│   │   │   ├── CustomizeIndexPage.jsx # Product Picker for Studio Customization
│   │   │   ├── CustomizePage.jsx      # Canvas Visualizer, Dragging, Gemini AI Art Gen
│   │   │   ├── DesignPreviewPage.jsx  # Final Preview & Direct Checkout
│   │   │   ├── CartPage.jsx           # Cart Ledger, 18% GST Calculation, Razorpay Checkout
│   │   │   ├── DashboardPage.jsx      # Customer Order Ledger & Production Milestones
│   │   │   ├── OrderConfirmationPage.jsx # Receipt & Secure Payment Tracking
│   │   │   ├── AIDesignerPage.jsx     # Spatial Diagnostics & Neural Harmonizer
│   │   │   ├── AdminDashboardPage.jsx # Clientele, Orders, & Catalog CRUD
│   │   │   ├── LoginPage.jsx          # JWT Authentication
│   │   │   └── RegisterPage.jsx       # Client Registration
│   │   └── App.jsx                    # React Router 6 Routes & Protection
│   └── vite.config.js                 # Proxy /api -> http://localhost:5000
│
├── server/                     # Node.js + Express.js + Mongoose Backend
│   ├── src/
│   │   ├── config/db.js               # MongoDB Connection
│   │   ├── models/                    # Mongoose Schemas (User, Product, CustomDesign, Order, RoomImage)
│   │   ├── controllers/               # Auth, Products, Orders, Customization, AI, Admin
│   │   ├── routes/                    # Express REST APIs (/api/*)
│   │   ├── middleware/                # JWT Auth, Admin Guards, Multer File Uploads
│   │   └── utils/
│   │       ├── seed.js                # Product Seeder
│   │       └── migrate_sqlite_to_mongodb.js # Full SQLite to MongoDB Data Importer
│   ├── .env                           # Environment Configuration
│   └── server.js                      # Express App Server Entrypoint
└── package.json                # Root orchestration scripts
```

---

## 🚀 Running the Migrated Application

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`

### 2. Start MongoDB
If MongoDB is installed on your system:
```powershell
mongod --port 27017 --dbpath ".mongodb_data/db"
```

### 3. Seed / Migrate Database Data
To seed all catalog products and migrate the original user accounts and sample orders into MongoDB:
```bash
npm run seed
```

### 4. Start the Application
You can run both the Node.js backend and React frontend concurrently:
```bash
npm run dev
```

Or run them individually in separate terminal windows:
- **Backend (Port 5000)**:
  ```bash
  npm run server
  ```
- **Frontend (Port 5173 / 5175)**:
  ```bash
  npm run client
  ```

---

## 🔑 Default Credentials

All original accounts have been transferred to MongoDB with standardized credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | `Nandinigottipati2004@gmail.com` | `Nandhini@2004` |
| **Admin (Backup)** | `admin@example.com` | `admin123` |
| **Customer** | `test@example.com` | `password123` |
| **Customer** | `dasettisaikumar@gmail.com` | `password123` |

---

## 🧪 Verified API Endpoints

- `GET  /api/health` — System Health
- `GET  /api/products` — Full product catalog from MongoDB
- `POST /api/auth/login` — JWT Authentication
- `POST /api/auth/register` — User signup
- `GET  /api/orders/my-orders` — User's order history
- `POST /api/orders/cart-checkout` — Multi-item cart checkout with Razorpay simulation
- `POST /api/designs` — Save bespoke canvas customizations
- `POST /api/ai/generate-art-spec` — Gemini AI neural abstract art generator
- `POST /api/ai/analyze-room` — Spatial Harmonizer room diagnostics
- `GET  /api/admin/dashboard` — Admin telemetry, orders, users, and catalog
- `PATCH /api/admin/orders/:id/status` — Live order status workflow updates
