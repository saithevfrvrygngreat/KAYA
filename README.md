# 🏺 Aura Decor — Online Personalized Home Décor Store

[![Laravel Version](https://img.shields.io/badge/Laravel-v11.x-red.svg?style=flat-square&logo=laravel)](https://laravel.com)
[![Vite](https://img.shields.io/badge/Vite-v5.x-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

**Aura Decor** is a premium, high-end co-creation and purchasing platform designed to revolutionize personalized home styling. Powered by standard **Laravel**, **Tailwind CSS**, and **HTML5 Canvas**, it offers users an immersive spatial visualization experience allowing them to preview artisan and custom-made décor directly inside their own homes before making a purchase.

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

---

## 🛠️ Technology Stack
*   **Backend Framework**: Laravel 11.x
*   **Frontend Pipeline**: Vite & Tailwind CSS
*   **Database**: SQLite (Self-contained, production-ready, no heavy SQL installation required)
*   **Curation Engine**: Pure Vanilla HTML5 Canvas (high rendering fidelity, zero external payload overhead)

---

## 🚀 Local Installation & Quick Setup

Follow these simple steps to spin up Aura Decor locally:

### 1. Clone & Access the Workspace
```bash
git clone https://github.com/mahendrakumarsingh/Online-Personalized-Home-D-cor-Store.git
cd Online-Personalized-Home-D-cor-Store
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
You can log in instantly with the seeded developer account to explore the entire purchase, customizer, and order history flow:

*   **Email**: `test@example.com`
*   **Password**: `password`

---

## 📜 License
This project is open-source and licensed under the [MIT license](https://opensource.org/licenses/MIT).
