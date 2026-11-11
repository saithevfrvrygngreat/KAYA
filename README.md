# 🏺 KAYA — Online Personalized Home Décor Store (Django + SQLite + React)

[![Python](https://img.shields.io/badge/Python-v3.12+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-v5.x-092E20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-v3.15-A30000?style=flat-square)](https://www.django-rest-framework.org/)
[![SQLite](https://img.shields.io/badge/SQLite-v3.x-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.x-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-38bdf8.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

**KAYA** is an artisanal personalized home décor platform. 100% of the luxury aesthetic, 3D interactive customization studio, AI Wall Art Spec generator, Brevo OTP authentication, and customer/admin workflows are powered by a modern **Python Django REST Framework** backend and a **SQLite** database, served alongside the original **React + Vite** frontend.

---

## 🏛️ System Architecture

```
KAYA/
├── Frontend/                     # React.js + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── context/AuthContext.jsx    # Persistent JWT Auth State
│   │   ├── services/api.js            # Axios Interceptor & Bearer Token Injection
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx          # Pull-chain Theme Toggle, Cart Counter, Drawer, Concierge
│   │   │   └── AdminLayout.jsx        # Administrative Shell
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Ken Burns Hero Slider, Aesthetic Quiz
│   │   │   ├── ProductsPage.jsx       # Artisan Catalog & Quick-view Modals
│   │   │   ├── CustomizeIndexPage.jsx # Product Picker for Customization
│   │   │   ├── CustomizePage.jsx      # Canvas Visualizer, Gemini AI Spec Gen
│   │   │   ├── DesignPreviewPage.jsx  # Final Preview & Direct Checkout
│   │   │   ├── CartPage.jsx           # Cart Ledger & Checkout
│   │   │   ├── DashboardPage.jsx      # Customer Order Ledger & Production Milestones
│   │   │   ├── OrderConfirmationPage.jsx # Receipt & Status Tracking
│   │   │   ├── AIDesignerPage.jsx     # Spatial Diagnostics & Neural Harmonizer
│   │   │   ├── AdminDashboardPage.jsx # Clientele, Orders, & Catalog CRUD
│   │   │   ├── LoginPage.jsx          # JWT Authentication
│   │   │   └── RegisterPage.jsx       # Client Registration & Brevo OTP Verification
│   │   └── App.jsx                    # React Router 6 Routes & Protection
│   └── package.json                   # Client Dependencies & Build Tooling
│
├── Backend/                      # Django + Django REST Framework Backend
│   ├── manage.py                      # Django CLI Management Script
│   ├── db.sqlite3                     # Production SQLite Database
│   ├── config/                        # Django Project Settings & Root Routing
│   │   ├── settings.py                # Database, CORS, JWT, Brevo SMTP & Static Config
│   │   ├── urls.py                    # Global API Router & React SPA Fallback
│   │   ├── wsgi.py                    # WSGI Server Interface
│   │   └── asgi.py                    # ASGI Server Interface
│   ├── apps/
│   │   ├── accounts/                  # Auth, JWT, OTP, User Details & Bcrypt
│   │   ├── products/                  # Catalog, Categories & Stock Management
│   │   ├── orders/                    # Cart, Checkout, Order Ledger & Items
│   │   ├── designs/                   # Custom Canvas State & Room Visualizer
│   │   ├── ai_services/               # Google Gemini Wall Art Palette Generator
│   │   └── admin_panel/               # Administrative Analytics & Order Management
│   ├── scripts/
│   │   ├── verify_all_endpoints.py    # Automated Test Suite (18 Integration Checks)
│   │   └── migrate_mongo_to_sqlite.py # Verified Migration Script
│   ├── requirements.txt               # Python Dependencies
│   └── entrypoint.sh                  # Container Entrypoint (Migrations + Collectstatic + Gunicorn)
│
├── Dockerfile                         # Multi-Stage Production Build (Node + Python)
├── run-dev.js                         # Concurrent Local Dev Orchestrator
└── package.json                       # Root Developer Workflow Runner
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Quick Start (Local Development)

1. **Install Frontend Dependencies:**
   ```bash
   npm install --prefix Frontend
   ```

2. **Install Backend Dependencies:**
   ```bash
   pip install -r Backend/requirements.txt
   ```

3. **Run Both Servers Concurrently:**
   ```bash
   npm run dev
   ```
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:5000/api/

---

## 🧪 Verification & Testing

Run the comprehensive integration test suite to verify all 18 backend endpoints:
```bash
npm run test:api
```

Compile the production React client:
```bash
npm run build
```

---

## 🔐 Credentials for Testing

| Role | Email | Password |
|---|---|---|
| **Admin** | `nandinigottipati2004@gmail.com` | `Nandhini@2004` |
| **Customer** | `dasettisaikumar@gmail.com` | `password123` |
