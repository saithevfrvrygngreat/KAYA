# 🔐 Authentication, Validation & Exception Handling Guide — KAYA (Django + SQLite)

This document provides a comprehensive technical breakdown of how **Authentication**, **Multi-Tier Validation**, and **Exception/Error Handling** are implemented across the entire KAYA Django + SQLite + React application.

---

## 📑 Table of Contents
1. [Authentication Architecture](#1-authentication-architecture)
   - [Overview of Auth Mechanism](#overview-of-auth-mechanism)
   - [Password Security & Hashing (Bcrypt)](#password-security--hashing-bcrypt)
   - [JWT Token Generation & Lifecycle (PyJWT)](#jwt-token-generation--lifecycle)
   - [Django REST Framework Auth Class & Permissions](#django-rest-framework-auth-class--permissions)
   - [Frontend State Management (React AuthContext)](#frontend-state-management-react-authcontext)
   - [Axios HTTP Interceptors & Token Injection](#axios-http-interceptors--token-injection)
   - [Client-Side Route Protection (`ProtectedRoute`, `AdminRoute`)](#client-side-route-protection)
2. [Multi-Tier Validation Architecture](#2-multi-tier-validation-architecture)
   - [Tier 1: Client-Side Form Validation (React)](#tier-1-client-side-form-validation-react)
   - [Tier 2: Django REST Framework Serializers & Views](#tier-2-django-rest-framework-serializers--views)
   - [Tier 3: SQLite Database Schema & Model Constraints](#tier-3-sqlite-database-schema--model-constraints)
   - [Validation Matrix](#validation-matrix)
3. [Exception & Error Handling Architecture](#3-exception--error-handling-architecture)
   - [HTTP Status Code Taxonomy](#http-status-code-taxonomy)
   - [Standard Error Response Schema](#standard-error-response-schema)
   - [Custom DRF Exception Handler](#custom-drf-exception-handler)
   - [External AI Service Fallback Exceptions (Gemini AI)](#external-ai-service-fallback-exceptions)
4. [Summary Table for Presentations & Viva](#4-summary-table-for-presentations--viva)

---

## 1. Authentication Architecture

### Overview of Auth Mechanism
KAYA implements a stateless, token-based **JSON Web Token (JWT)** authentication flow coupled with **Role-Based Access Control (RBAC)** to distinguish between regular customers and store administrators.

```
┌─────────────────┐       1. POST /api/auth/login       ┌───────────────────────────┐
│                 │ ──────────────────────────────────> │                           │
│  React Client   │                                     │  Django REST Framework    │
│  (Port 5173)    │ <────────────────────────────────── │  (Port 5000 / Port 10000) │
│                 │       2. Returns signed JWT Token   └───────────────────────────┘
└─────────────────┘
        │
        │ 3. Stores JWT in localStorage ('kaya_token')
        ▼
┌─────────────────┐       4. GET /api/orders/ (Header)  ┌───────────────────────────┐
│ Axios           │    "Authorization: Bearer <token>"  │ JWTAuthentication Class   │
│ Interceptor     │ ──────────────────────────────────> │ validates token & user    │
└─────────────────┘                                     └───────────────────────────┘
```

---

### Password Security & Hashing (Bcrypt)
- **File:** `Backend/apps/accounts/models.py`
- **Mechanism:** Passwords are never stored in plaintext. They are salted and hashed using **`bcrypt`** with secure salt rounds.
- **Model Methods:**
  ```python
  import bcrypt

  def set_password(self, raw_password: str):
      salt = bcrypt.gensalt(rounds=12)
      self.password = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')

  def check_password(self, raw_password: str) -> bool:
      if not self.password:
          return False
      return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
  ```
- **Serialization Safety:** The user serializer explicitly marks the `password` field as `write_only=True`, guaranteeing that password hashes are never leaked in API responses.

---

### JWT Token Generation & Lifecycle
- **Files:**
  - `Backend/apps/accounts/authentication.py`
  - `Backend/.env`
- **Secret Key:** `JWT_SECRET` (falls back to `DJANGO_SECRET_KEY` if unspecified).
- **Payload:** User identifier (`{ 'id': user.id, 'role': user.role, 'exp': ... }`).
- **Expiration:** Tokens are valid for **7 days** (`JWT_EXPIRES_IN=7d`).
- **Token Issuer:**
  ```python
  import jwt
  from datetime import datetime, timedelta

  def generate_token(user) -> str:
      payload = {
          'id': user.id,
          'role': user.role,
          'exp': datetime.utcnow() + timedelta(days=7),
          'iat': datetime.utcnow(),
      }
      return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
  ```

---

### Django REST Framework Auth Class & Permissions
Located in `Backend/apps/accounts/authentication.py`:

1. **`JWTAuthentication` (Stateless Token Authenticator):**
   - Inspects the `Authorization` HTTP header for the `Bearer <token>` scheme.
   - Decodes and verifies the signature using `PyJWT` and `JWT_SECRET`.
   - Fetches the active `User` record from SQLite. Returns `(user, None)`.
2. **`IsCustomer` / `IsAdmin` Permissions:**
   - Evaluates `request.user.role == 'admin'` for privileged management routes (`/api/admin/*`, product creation, order status dispatch).
   - Allows public read access for catalog browsing (`/api/products/`, `/api/designs/`) while restricting mutation endpoints.

---

### Frontend State Management (React AuthContext)
- **File:** `Frontend/src/context/AuthContext.jsx`
- Uses React Context to broadcast `user`, `token`, `login()`, `register()`, and `logout()` throughout the component tree.
- On mount, restores session from `localStorage.getItem('kaya_token')` and queries `/api/auth/me` to refresh user details.

---

### Axios HTTP Interceptors & Token Injection
- **File:** `Frontend/src/services/api.js`
- Automatically attaches the `Authorization: Bearer <token>` header to all outgoing requests.
- Handles global `401 Unauthorized` responses by clearing local credentials and directing users to login.

---

## 2. Multi-Tier Validation Architecture

| Tier | Layer | Technology | Responsibilities |
|---|---|---|---|
| **Tier 1** | Client Side | React & HTML5 | Real-time UX feedback, regex email check, password confirmation, required form inputs. |
| **Tier 2** | API Controller | DRF Serializers | Field validation, uniqueness checks, JSON schema validation for 3D customization matrices, price bounds. |
| **Tier 3** | Database | SQLite & Django ORM | Unique email constraints, foreign key referential integrity (`CASCADE`), check constraints, non-null fields. |

---

## 3. Exception & Error Handling Architecture

### Standard Error Response Schema
All error responses from Django follow the unified JSON structure expected by the React client:
```json
{
  "success": false,
  "message": "Human-readable description of error.",
  "errors": {
    "field_name": ["Specific validation message"]
  }
}
```

### External AI Service Fallback Exceptions (Gemini AI)
- **File:** `Backend/apps/ai_services/views.py`
- If the external Gemini API is unreachable, times out, or returns a quota rate limit, the endpoint catches the exception gracefully, logs the event, and delivers a deterministic architectural fallback palette, preventing UI crashes in the interactive 3D Room Visualizer.

---

## 4. Summary Table for Presentations & Viva

| Aspect | Implementation Details |
|---|---|
| **Framework** | Django 6.1 + Django REST Framework |
| **Database** | SQLite with Foreign Keys & Indexes |
| **Authentication** | Custom Stateless PyJWT (`JWTAuthentication`) |
| **Password Storage** | Bcrypt with 12 salt rounds (`set_password`, `check_password`) |
| **OTP Service** | Brevo SMTP Email Integration (`smtp-relay.brevo.com`) |
| **AI Integration** | Google Gemini API (with deterministic fallback matrix) |
| **Deployment** | Multi-Stage Dockerfile (Node.js Vite build + Python 3.12 Gunicorn/WhiteNoise) |
