"""
Staging settings for the shared dev server (school.raipursolutions.com).

Inherits production TLS/cookie defaults but keeps developer-friendly options:
- Optional DEBUG via env
- Browsable API renderer for quick inspection
- Shorter HSTS preload (staging subdomain should not be preloaded)
"""

from .production import *  # noqa: F401, F403

DEBUG = env.bool("DEBUG", default=False)  # noqa: F405

# Staging uses HTTPS via Nginx; keep secure cookies when TLS is enabled.
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)  # noqa: F405

# Do not HSTS-preload a shared staging host.
SECURE_HSTS_PRELOAD = False
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=86400)  # noqa: F405

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
)
