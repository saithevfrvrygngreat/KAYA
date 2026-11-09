# 🔐 Authentication, Validation & Exception Handling Guide — KAYA

This document provides a comprehensive technical breakdown of how **Authentication**, **Multi-Tier Validation**, and **Exception/Error Handling** are implemented across the entire KAYA MERN stack application.

---

## 📑 Table of Contents
1. [Authentication Architecture](#1-authentication-architecture)
   - [Overview of Auth Mechanism](#overview-of-auth-mechanism)
   - [Password Security & Hashing (Bcrypt)](#password-security--hashing-bcrypt)
   - [JWT Token Generation & Lifecycle](#jwt-token-generation--lifecycle)
   - [Backend Auth Middleware (`protect`, `optionalAuth`, `adminOnly`)](#backend-auth-middleware)
   - [Frontend State Management (React AuthContext)](#frontend-state-management-react-authcontext)
   - [Axios HTTP Interceptors & Token Injection](#axios-http-interceptors--token-injection)
   - [Client-Side Route Protection (`ProtectedRoute`, `AdminRoute`)](#client-side-route-protection)
2. [Multi-Tier Validation Architecture](#2-multi-tier-validation-architecture)
   - [Tier 1: Client-Side Form Validation (React)](#tier-1-client-side-form-validation-react)
   - [Tier 2: API Controller & Request Validation (Express)](#tier-2-api-controller--request-validation-express)
   - [Tier 3: Database Schema Validation (Mongoose ODM)](#tier-3-database-schema-validation-mongoose-odm)
   - [File & Validation Matrix](#file--validation-matrix)
3. [Exception & Error Handling Architecture](#3-exception--error-handling-architecture)
   - [HTTP Status Code Taxonomy](#http-status-code-taxonomy)
   - [Standard Error Response Schema](#standard-error-response-schema)
   - [Specific Exceptions Handled in KAYA](#specific-exceptions-handled-in-kaya)
   - [Global Express Error Handler](#global-express-error-handler)
   - [Database Connection Auto-Healing & Stale Lock Recovery](#database-connection-auto-healing--stale-lock-recovery)
   - [External AI Service Fallback Exceptions](#external-ai-service-fallback-exceptions)
4. [Summary Table for Presentations & Viva](#4-summary-table-for-presentations--viva)

---

## 1. Authentication Architecture

### Overview of Auth Mechanism
KAYA implements a stateless, token-based **JSON Web Token (JWT)** authentication flow coupled with **Role-Based Access Control (RBAC)** to distinguish between regular customers and store administrators.

```
┌─────────────────┐       1. POST /api/auth/login       ┌─────────────────────┐
│                 │ ──────────────────────────────────> │                     │
│  React Client   │                                     │  Express Backend    │
│  (Port 5173)    │ <────────────────────────────────── │  (Port 5000)        │
│                 │       2. Returns signed JWT Token   └─────────────────────┘
└─────────────────┘
        │
        │ 3. Stores JWT in localStorage ('kaya_token')
        ▼
┌─────────────────┐       4. GET /api/orders (with Header) ┌─────────────────────┐
│ Axios           │    "Authorization: Bearer <token>"     │ protect Middleware  │
│ Interceptor     │ ─────────────────────────────────────> │ verifies signature  │
└─────────────────┘                                        └─────────────────────┘
```

---

### Password Security & Hashing (Bcrypt)
- **File:** [`server/src/models/User.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/User.js#L35-L45)
- **Mechanism:** Passwords are never stored in plaintext. They are salted and hashed using **`bcryptjs`** with **12 salt rounds**.
- **Automated Pre-Save Hook:** Whenever a user document is created or its password is modified, Mongoose automatically hashes the password:
  ```javascript
  // server/src/models/User.js
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });
  ```
- **Password Obfuscation (`select: false`):** The password field is explicitly marked `select: false`. Standard database queries (`User.find()`, `User.findById()`) will never leak the hash in API responses.
- **Verification Method:** A helper method `comparePassword()` safely verifies submitted credentials:
  ```javascript
  userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  ```

---

### JWT Token Generation & Lifecycle
- **Files:**
  - [`server/src/controllers/authController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/authController.js#L7-L11)
  - [`server/.env`](file:///c:/Users/hp/OneDrive/KAYA-main/server/.env)
- **Secret Key:** `JWT_SECRET` stored securely in the server environment.
- **Payload:** User identifier (`{ id: user._id }`).
- **Expiration:** Tokens expire after **7 days** (`JWT_EXPIRES_IN=7d`).
- **Token Issuer:**
  ```javascript
  const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  };
  ```

---

### Backend Auth Middleware
Located in [`server/src/middleware/auth.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/middleware/auth.js):

1. **`protect` (Authentication Guard):**
   - Extracts the token from the `Authorization: Bearer <token>` header.
   - Verifies the signature against `JWT_SECRET`.
   - Fetches the user from MongoDB (excluding password) and binds it to `req.user`.
   - Returns **`401 Unauthorized`** if the header is missing, malformed, or the token is expired.
2. **`optionalAuth` (Guest/User Hybrid):**
   - If an `Authorization` header is passed, decodes it and attaches `req.user`.
   - If no token is provided, execution continues normally. Allows guest visualizer saves and guest checkouts while linking authenticated users automatically.
3. **`adminOnly` (Role-Based Authorization):**
   - Checks if `req.user.is_admin === true`.
   - If the user is not an administrator, blocks access immediately with **`403 Forbidden`** (`{ message: 'Admin access required.' }`).

---

### Frontend State Management (React AuthContext)
- **File:** [`client/src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/context/AuthContext.jsx)
- React Context (`useAuth()`) provides global access to:
  - `user`: Currently authenticated user profile.
  - `isAdmin`: Boolean helper derived from `user?.is_admin`.
  - `loading`: Initialization state while validating existing tokens on page reload.
  - `login(email, password)`: Authenticates, saves token to `localStorage`, and sets state.
  - `register(formData)`: Registers, stores token, and updates state.
  - `logout()`: Clears `localStorage.removeItem('kaya_token')` and resets state to `null`.

---

### Axios HTTP Interceptors & Token Injection
- **File:** [`client/src/services/api.js`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/services/api.js)
- **Request Interceptor:** Automatically appends the Bearer token to all outgoing API requests:
  ```javascript
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kaya_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```
- **Response Interceptor:** Automatically catches global `401 Unauthorized` responses and purges stale tokens from `localStorage`:
  ```javascript
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('kaya_token');
      }
      return Promise.reject(error);
    }
  );
  ```

---

### Client-Side Route Protection
Located in:
- [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/components/ProtectedRoute.jsx): Blocks access to `/dashboard` for unauthenticated visitors and redirects them to `/login`.
- [`client/src/components/AdminRoute.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/components/AdminRoute.jsx): Protects `/admin` routes. Non-logged-in users are redirected to `/login`, while non-admin authenticated users are redirected to `/` with a 403 block.

---

## 2. Multi-Tier Validation Architecture

KAYA employs a **Defense-in-Depth** validation strategy spanning three tiers:

```
[ Tier 1: Client Browser ]  --> HTML5 + Regex + State Checks (Instant UI Feedback)
           │
           ▼
[ Tier 2: Express Server ]   --> Controller & Middleware Validation (422 Response)
           │
           ▼
[ Tier 3: Database Layer ]   --> Mongoose ODM Schema Constraints (Data Integrity)
```

---

### Tier 1: Client-Side Form Validation (React)

| Validation Requirement | File | Implementation Details |
|---|---|---|
| **Registration Live Password Strength** | [`RegisterPage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/RegisterPage.jsx#L18-L26) | Real-time checklist verifying: `length >= 8`, `/[A-Z]/`, `/[a-z]/`, `/[0-9]/`, and special symbols `/[^A-Za-z0-9]/`. |
| **Password Match** | [`RegisterPage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/RegisterPage.jsx#L30) | Verifies `password === passwordConfirmation` before submission. |
| **Email Format** | [`LoginPage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/LoginPage.jsx), [`RegisterPage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/RegisterPage.jsx) | HTML5 `type="email"` + JavaScript email regex. |
| **Checkout Shipping Details** | [`CartPage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/CartPage.jsx) | Checks for non-empty address, name, valid 10-digit phone number, and non-empty cart array. |
| **Canvas Coordinates & Boundaries** | [`CustomizePage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/CustomizePage.jsx) | Clamps draggable items within room canvas bounds (`minX`, `maxX`, `minY`, `maxY`). |
| **File Upload Restrictions** | [`CustomizePage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/CustomizePage.jsx) | Restricts room photo uploads to image MIME types under 4MB before sending to the server. |

---

### Tier 2: API Controller & Request Validation (Express)

Before interacting with the database, every API controller sanitizes and validates incoming parameters:

#### 1. User Registration Validation ([`authController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/authController.js#L18-L41))
- Validates that `name` is provided and trimmed.
- Validates `email` against the regex `/^\S+@\S+\.\S+$/`.
- Enforces strong password policy (min 8 chars, uppercase, lowercase, numeric, and special character).
- Verifies `password === password_confirmation`.
- Checks for email duplication in MongoDB: `User.findOne({ email })`.
- If invalid, returns **`422 Unprocessable Entity`** with structured error dictionary:
  ```json
  {
    "message": "Validation failed",
    "errors": {
      "email": "This email address is already in use.",
      "password": "Password must be at least 8 characters long."
    }
  }
  ```

#### 2. Order Creation Validation ([`orderController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/orderController.js#L48-L60))
- Validates existence of `custom_design_id`, `shipping_address`, `customer_name`, `customer_phone`, `customer_email`, and `payment_id`.
- Validates customer email format.
- Returns **`422 Unprocessable Entity`** if any mandatory purchase field is absent.

#### 3. Order Status Update Validation ([`adminController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/adminController.js#L66-L70))
- Restricts status changes to approved states:
  ```javascript
  const validStatuses = ['placed', 'processing', 'shipping', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(422).json({
      message: 'Invalid status.',
      errors: { status: `Status must be one of: ${validStatuses.join(', ')}` }
    });
  }
  ```

#### 4. Multer Upload Validation ([`upload.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/middleware/upload.js#L20-L33))
- **MIME Type Whitelist:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`. Rejects executable files or scripts with an error: `'Only JPEG, PNG, GIF, and WebP images are allowed'`.
- **Size Limit:** Max **4MB** (`limits: { fileSize: 4 * 1024 * 1024 }`).

---

### Tier 3: Database Schema Validation (Mongoose ODM)

Mongoose provides the final layer of schema enforcement at the database driver level:

| Model | File | Constraints & Enforcements |
|---|---|---|
| **`User`** | [`User.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/User.js) | • `name`: Required, trim, max 255.<br>• `email`: Required, unique, lowercase, regex match.<br>• `password`: Required, min 8 chars, `select: false`. |
| **`Product`** | [`Product.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/Product.js) | • `name`: Required, unique, trim.<br>• `category`: Enum restricted to `['Wall Decor', 'Lighting', 'Soft Furnishings', 'Decorative Accents', 'Rugs & Mats']`.<br>• `base_price`: Required, non-negative (`min: 0`). |
| **`Order`** | [`Order.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/Order.js) | • `order_number`: Required, unique.<br>• `total_price`: Required, non-negative (`min: 0`).<br>• `status`: Enum (`placed`, `processing`, `shipping`, `delivered`, `cancelled`).<br>• `payment_status`: Enum (`pending`, `paid`, `failed`, `refunded`). |
| **`CustomDesign`** | [`CustomDesign.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/CustomDesign.js) | • `product`: Required `ObjectId` ref.<br>• `design_json`: Required canvas data.<br>• `status`: Enum (`saved`, `ordered`). |
| **`RoomImage`** | [`RoomImage.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/RoomImage.js) | • `path`: Required file path string. |

---

## 3. Exception & Error Handling Architecture

### HTTP Status Code Taxonomy
KAYA adheres strictly to standard HTTP status codes:

| Status Code | Meaning | When Triggered in KAYA |
|---|---|---|
| **`200 OK`** | Success | Successful data retrieval, status updates, or login. |
| **`201 Created`** | Resource Created | Successful user registration or order placement. |
| **`400 Bad Request`** | Malformed Request | Invalid ObjectId parameter format or missing query data. |
| **`401 Unauthorized`** | Authentication Failure | Missing/invalid/expired JWT token or wrong password. |
| **`403 Forbidden`** | Authorization Failure | Regular customer attempting to access `/api/admin` or someone else's order. |
| **`404 Not Found`** | Resource Not Found | Product ID or Order ID does not exist in MongoDB. |
| **`422 Unprocessable`**| Validation Error | Field validation failure (email format, weak password, duplicate email). |
| **`500 Internal Error`**| Server Exception | Uncaught runtime errors, database disconnection, or external API failures. |

---

### Standard Error Response Schema
All error responses return a consistent JSON contract:
```json
{
  "message": "Human-readable summary of the error",
  "errors": {
    "field_name": "Specific validation explanation"
  }
}
```

---

### Specific Exceptions Handled in KAYA

#### 1. Mongoose `ValidationError`
- **Cause:** Occurs when an insert or update violates schema constraints (e.g. negative price, invalid enum).
- **Handling:** Caught in try/catch blocks; status 400 or 422 returned with formatted error messages.

#### 2. Duplicate Key Exception (`MongoServerError` Code 11000)
- **Cause:** Attempting to insert a duplicate value for a unique indexed field (`users.email`, `products.name`, `orders.order_number`).
- **Handling:** Caught proactively before write via `.findOne()` queries (e.g. [`authController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/authController.js#L37-L40)), returning a user-friendly 422 error: `'This email address is already in use.'`.

#### 3. Invalid `ObjectId` / Cast Exceptions
- **Cause:** Requesting `/api/products/123` where `123` is not a valid 24-character hexadecimal MongoDB `ObjectId`.
- **Handling:** In [`orderController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/orderController.js#L32) and [`productController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/productController.js), queries return `404 Not Found` rather than crashing the Node process.

#### 4. JWT Exceptions (`JsonWebTokenError`, `TokenExpiredError`)
- **Cause:** Tampered token signatures or tokens older than 7 days.
- **Handling:** In [`server/src/middleware/auth.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/middleware/auth.js#L22-L24):
  ```javascript
  catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
  ```

#### 5. File Upload Exceptions (Multer)
- **Cause:** Uploaded files exceeding 4MB or non-image extensions (.exe, .pdf).
- **Handling:** The file filter rejects non-whitelisted MIME types with an explicit error, and Multer emits a `LIMIT_FILE_SIZE` error that maps to status 400.

---

### Global Express Error Handler
Located in [`server/server.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/server.js#L73-L81):
```javascript
// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```
- Prevents the Node.js server process from terminating when an unhandled exception occurs.
- Automatically hides raw error stack traces in production to protect sensitive infrastructure information.

---

### Database Connection Auto-Healing & Stale Lock Recovery
- **File:** [`server/src/config/db.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/config/db.js#L62-L135)
- **Stale `mongod.lock` Recovery:** If the computer crashed or the server was terminated abruptly, MongoDB leaves a lock file. `db.js` inspects port 27017, and if inactive, automatically clears the stale lock file before launching the daemon.
- **Retry Mechanism:** Uses an exponential retry loop (up to 5 retries with 2-second delays) to gracefully accommodate daemon spin-up times.
- **IPv4 Fallback (`family: 4`):** Eliminates `ECONNREFUSED` exceptions caused by Node.js 18+ resolving `localhost` to IPv6 `::1`.

---

### External AI Service Fallback Exceptions
- **File:** [`server/src/controllers/aiController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/aiController.js)
- **Problem:** If the `GEMINI_API_KEY` is not provided in `.env`, or if Google Gemini's API experiences rate limits (HTTP 429) or network timeouts:
- **Resilient Fallback:** The controller automatically intercepts the failure and falls back to an algorithmic design generation engine using **Pollinations AI** and local mathematical color-harmony algorithms. The frontend visualizer continues functioning seamlessly with zero downtime or user-facing errors.

---

## 4. Summary Table for Presentations & Viva

| Topic | Implementation Details | Key Files |
|---|---|---|
| **Authentication Type** | JWT (JSON Web Tokens) with Bearer token authentication | [`server/src/middleware/auth.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/middleware/auth.js) |
| **Password Hashing** | `bcryptjs` with 12 salt rounds in Mongoose `pre('save')` hook | [`server/src/models/User.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/User.js) |
| **Token Expiry** | 7 Days (`JWT_EXPIRES_IN=7d`) | [`server/src/controllers/authController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/authController.js) |
| **Role-Based Access** | `is_admin` boolean flag checked via `adminOnly` middleware | [`server/src/middleware/auth.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/middleware/auth.js) |
| **Client Auth State** | React Context (`useAuth`) with `localStorage` persistence | [`client/src/context/AuthContext.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/context/AuthContext.jsx) |
| **Client Route Guards** | `<ProtectedRoute>` and `<AdminRoute>` wrappers | [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/components/ProtectedRoute.jsx) |
| **Frontend Validation** | Live regex checks for password strength, email, and confirmation | [`client/src/pages/RegisterPage.jsx`](file:///c:/Users/hp/OneDrive/KAYA-main/client/src/pages/RegisterPage.jsx) |
| **Backend Validation** | Request body validation returning HTTP 422 with field-level errors | [`server/src/controllers/authController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/authController.js) |
| **Database Validation** | Mongoose constraints: `required`, `enum`, `min`, `maxlength`, `match` | [`server/src/models/`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/models/) |
| **File Validation** | Multer MIME type filter (JPEG/PNG/WEBP) & 4MB limit | [`server/src/middleware/upload.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/middleware/upload.js) |
| **Global Error Handler** | Express 4-argument error middleware returning clean JSON | [`server/server.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/server.js) |
| **AI Fallback** | Dual-engine fallback from Gemini API to algorithmic Pollinations | [`server/src/controllers/aiController.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/controllers/aiController.js) |
| **DB Auto-Healing** | Automatic stale lock cleanup & 5-retry reconnection loop | [`server/src/config/db.js`](file:///c:/Users/hp/OneDrive/KAYA-main/server/src/config/db.js) |

