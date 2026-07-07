from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "backend"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# debug_toolbar disabled to avoid NoReverseMatch 'djdt' errors
# INSTALLED_APPS += [
#     "debug_toolbar",
# ]

# MIDDLEWARE = [
#     "debug_toolbar.middleware.DebugToolbarMiddleware",
# ] + MIDDLEWARE


INTERNAL_IPS = ["127.0.0.1", "localhost"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
)

# Monkeypatch database version check for older MariaDB versions in local dev
from django.db.backends.base.base import BaseDatabaseWrapper

BaseDatabaseWrapper.check_database_version_supported = lambda self: None

from django.db.backends.mysql.features import DatabaseFeatures

DatabaseFeatures.can_return_columns_from_insert = False
DatabaseFeatures.can_return_rows_from_bulk_insert = False

# Use local memory cache for local development without Redis
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "school-erp-local-cache",
    }
}
