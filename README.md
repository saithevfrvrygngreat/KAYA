# 🏺 KAYA — Online Personalized Home Décor Store

[![Laravel Version](https://img.shields.io/badge/Laravel-v11.x-red.svg?style=flat-square&logo=laravel)](https://laravel.com)
[![Vite](https://img.shields.io/badge/Vite-v5.x-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

**KAYA** is a premium, high-end co-creation and purchasing platform designed to revolutionize personalized home styling. Powered by **Laravel**, **Tailwind CSS**, and **HTML5 Canvas**, it offers users an immersive spatial visualization experience allowing them to preview artisan and custom-made décor directly inside their own homes before making a purchase.

---

## ✨ Primary Core Features

### 🎨 1. Interactive 3-Step Spatial Visualizer
*   **Real-Time Curation Canvas**: Seamlessly overlay glowing light strings, bespoke rugs, soft furnishings, and wall art in a dynamic web canvas interface.
*   **Custom Room Backdrops**: Upload a photo of any space (bedroom, living room, ceiling) and visualize the products directly over the physical room environment.
*   **Dimensional & Styling Curation**: Dynamically modify scale factors, dimensions, moulding colors, and coordinates to match visual specifications.

### 🛍️ 2. Premium Curated Artisan Catalog
*   **Aesthetic Typography & Glassmorphism Grid**: Responsive masonry-like layout designed using curated HSL color schemes and custom geometric shapes.
*   **Quick View Modal popups**: Fully interactive quick views detailing materials, dimensions, and specifications.
*   **Direct Add-to-Cart Flow**: Intuitive local-storage cart system with interactive amount calculations and cart badges.

### 🔒 3. Secure Cart & Mandatory Checkout Authentication
*   **Gated Purchase Journey**: Restricts checkout strictly to authenticated users, ensuring that every curated design is linked to a permanent personal purchase history.
*   **Frictionless Redirect Loops**: Intended path tracking that seamlessly guides unregistered visitors through login and returns them directly to their pending cart.
*   **Automatic Credentials Prefilling**: Automatically populates full names and email addresses from the logged-in profile.

### 💳 4. Mock Razorpay Payment Simulator
*   **Realistic Transaction Loop**: Integrated mock Razorpay payment gateway UI.
*   **Payment & Order Lifecycle**: Clears user carts, processes order records in the SQLite database, and redirects to a gorgeous Curated Order timeline confirmation page.

### 📊 5. Operations Command Centre (Admin Portal)
*   **Clientele Directory**: Manage administrators and customer curators with real-time switching, role indicators, and search.
*   **Orders & Transactions Ledger**: Update order status (Placed, Processing, Shipping, Delivered, Cancelled) and view customer payment keys.
*   **Products Curation Ledger**: Add and manage artwork collections, stock levels, and store visibility.

---

## 🛠️ Technology Stack
*   **Backend Framework**: Laravel 11.x
*   **Frontend Pipeline**: Vite & Tailwind CSS
*   **Database**: SQLite (Self-contained, production-ready, no heavy SQL installation required)
*   **Curation Engine**: Pure Vanilla HTML5 Canvas (high rendering fidelity, zero external payload overhead)

---

## 🚀 Local Installation & Quick Setup

Follow these simple steps to spin up KAYA locally:

### 1. Clone & Access the Workspace
```bash
git clone https://github.com/saithevfrvrygngreat/KAYA.git
cd KAYA
```

### 2. Install Project Dependencies
```bash
composer install
npm install
```

### 3. Environment Setup
Duplicate the example environment file and generate your application key:
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Database Setup & Seed
Initialize the SQLite database and seed the artisan catalog collections:
```bash
# Create local SQLite file if not present
touch database/database.sqlite

# Run migrations and seed data
php artisan migrate:fresh --seed
```

### 5. Compile Assets & Launch Local Servers
Run the asset compiler and local development server in separate terminal tabs:
```bash
# Tab 1: Compile assets
npm run dev

# Tab 2: Launch Laravel application
php artisan serve
```
Open `http://127.0.0.1:8000` in your web browser.

---

## 🔐 Demonstration Credentials
You can log in instantly with the seeded developer accounts to explore the customer visualizer or the administration portal:

### 👤 Customer curator
*   **Email**: `test@example.com`
*   **Password**: `password`

### 🔑 Administrator
*   **Email**: `Nandinigottipati2004@gmail.com`
*   **Password**: `Nandhini@2004`

---

## 📜 License
This project is open-source and licensed under the [MIT license](https://opensource.org/licenses/MIT).
