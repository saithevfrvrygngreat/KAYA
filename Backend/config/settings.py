import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Add apps folder to sys.path
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))

# Load environment variables
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY') or os.getenv('JWT_SECRET') or 'django-insecure-kaya-bespoke-luxury-2026'

DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

allowed_hosts_str = os.getenv('ALLOWED_HOSTS', '*')
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(',') if h.strip()] or ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',

    # Local apps
    'apps.accounts',
    'apps.products',
    'apps.orders',
    'apps.designs',
    'apps.ai_services',
    'apps.admin_panel',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.accounts.authentication.JWTAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Database: SQLite
db_path = os.getenv('DATABASE_PATH')
if db_path:
    p = Path(db_path)
    if p.is_absolute():
        DB_FILE = p
    elif (BASE_DIR / p).exists():
        DB_FILE = BASE_DIR / p
    elif (BASE_DIR / p.name).exists():
        DB_FILE = BASE_DIR / p.name
    elif (BASE_DIR.parent / p).exists():
        DB_FILE = BASE_DIR.parent / p
    else:
        DB_FILE = BASE_DIR / p.name
else:
    DB_FILE = BASE_DIR / 'db.sqlite3'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': str(DB_FILE),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media / Uploaded files
MEDIA_URL = '/uploads/'
MEDIA_ROOT = BASE_DIR / 'uploads'

# Frontend Dist Location (for SPA Serving)
FRONTEND_DIST_DIR = BASE_DIR.parent / 'Frontend' / 'dist'
STATICFILES_DIRS = []
if FRONTEND_DIST_DIR.exists():
    STATICFILES_DIRS.append(FRONTEND_DIST_DIR)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Disable automatic 301 redirects on trailing slashes for clean SPA REST APIs
APPEND_SLASH = False

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'https://kaya-9wta.onrender.com',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
]
client_url = os.getenv('CLIENT_URL')
if client_url and client_url not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(client_url)

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.accounts.authentication.CustomJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'UNAUTHENTICATED_USER': None,
}

# JWT Settings
JWT_SECRET = os.getenv('JWT_SECRET', 'kaya_luxury_super_secret_jwt_key_2026_modern_secure')
JWT_EXPIRES_IN = os.getenv('JWT_EXPIRES_IN', '7d')

# Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Brevo / SMTP Email
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
SMTP_SECURE = os.getenv('SMTP_SECURE', 'false').lower() == 'true'
EMAIL_FROM = os.getenv('EMAIL_FROM') or os.getenv('SMTP_FROM_EMAIL') or (f'"KaYa Bespoke" <{SMTP_USER}>' if SMTP_USER else 'noreply@kaya.luxury')

if SMTP_HOST and SMTP_USER:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = SMTP_HOST
    EMAIL_PORT = SMTP_PORT
    EMAIL_USE_TLS = not SMTP_SECURE
    EMAIL_USE_SSL = SMTP_SECURE
    EMAIL_HOST_USER = SMTP_USER
    EMAIL_HOST_PASSWORD = SMTP_PASS
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

