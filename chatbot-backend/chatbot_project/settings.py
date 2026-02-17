"""
Django settings for chatbot_project project.
"""
import os
from pathlib import Path
from datetime import timedelta
from urllib.parse import urlparse, urlunparse, quote
from dotenv import load_dotenv
import dj_database_url

load_dotenv()


def fix_database_url(url):
    """URL-encode the password portion of a database URL to handle special characters."""
    if not url:
        return url
    try:
        parsed = urlparse(url)
        if parsed.password:
            # Re-encode the password to handle special characters
            encoded_password = quote(parsed.password, safe='')
            # Reconstruct the netloc with encoded password
            if parsed.username:
                netloc = f"{parsed.username}:{encoded_password}@{parsed.hostname}"
            else:
                netloc = parsed.hostname
            if parsed.port:
                netloc += f":{parsed.port}"
            # Reconstruct the URL
            return urlunparse((
                parsed.scheme,
                netloc,
                parsed.path,
                parsed.params,
                parsed.query,
                parsed.fragment
            ))
    except Exception:
        pass
    return url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-change-this-in-production')

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,.onrender.com').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'chatbot_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'chatbot_project.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Use PostgreSQL in production - supports both DATABASE_URL and individual env vars
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DATABASE_URL = os.getenv('DATABASE_URL')

# Prefer individual env vars (avoids URL encoding issues with special chars in password)
if DB_HOST and DB_NAME:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': DB_HOST,
        'PORT': os.getenv('DB_PORT', '5432'),
        'NAME': DB_NAME,
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
elif DATABASE_URL:
    # Try DATABASE_URL with encoding fix
    DATABASE_URL = fix_database_url(DATABASE_URL)
    try:
        DATABASES['default'] = dj_database_url.config(default=DATABASE_URL, conn_max_age=600)
    except Exception:
        pass  # Fall back to SQLite if parsing fails

# Custom User Model
AUTH_USER_MODEL = 'api.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3001",
    "http://127.0.0.1:3001",
]

# Add production frontend URL from environment
FRONTEND_URL = os.getenv('FRONTEND_URL', '')
if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

# Allow all origins in production (can be restricted later)
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL', 'False').lower() == 'true'
CORS_ALLOW_CREDENTIALS = True

# Google Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Email Settings (for verification emails)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Use SMTP in production
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Chat history cleanup (days)
CHAT_HISTORY_RETENTION_DAYS = 30

# Documents directory for RAG
DOCUMENTS_DIR = BASE_DIR / 'documents'
