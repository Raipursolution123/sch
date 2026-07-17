"""Cache-backed JWT refresh-token blacklist.

Uses Django's cache (Redis in staging/prod, locmem in local) instead of
simplejwt's token_blacklist tables, which require a managed FK to `users`.
Our AUTH_USER_MODEL maps to an unmanaged legacy `users` table, so those
migrations fail in empty CI databases and against db_current.
"""

from __future__ import annotations

import time

from django.core.cache import cache

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

CACHE_KEY_PREFIX = "jwt_refresh_blacklist:"


def _ttl_from_token(token: RefreshToken) -> int:
    exp = token.get("exp")
    if not exp:
        return 60 * 60 * 24 * 7
    return max(int(exp) - int(time.time()), 1)


def blacklist_refresh_token(token_str: str) -> None:
    """Mark a refresh token (by jti) as unusable until it expires."""
    token = RefreshToken(token_str)
    jti = token.get("jti")
    if not jti:
        raise TokenError("Token has no jti claim")
    cache.set(f"{CACHE_KEY_PREFIX}{jti}", "1", timeout=_ttl_from_token(token))


def is_refresh_token_blacklisted(token_str: str) -> bool:
    try:
        token = RefreshToken(token_str)
    except TokenError:
        return False
    jti = token.get("jti")
    if not jti:
        return False
    return cache.get(f"{CACHE_KEY_PREFIX}{jti}") is not None
