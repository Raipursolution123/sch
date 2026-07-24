"""Redis-backed reference-data cache (LocMem in local dev)."""

from collections.abc import Callable
from typing import TypeVar

from django.core.cache import cache

T = TypeVar("T")

CACHE_TTL_REFERENCE = 300  # 5 minutes
CACHE_TTL_PERMISSIONS = 300  # 5 minutes

CACHE_KEY_CURRENT_SESSION_ID = "academics:current_session_id"
CACHE_KEY_ACTIVE_SESSION = "academics:active_session"
CACHE_KEY_SESSIONS_LIST = "academics:sessions:list:{active_only}"


def cache_get_or_set(key: str, factory: Callable[[], T], *, timeout: int) -> T:
    cached = cache.get(key)
    if cached is not None:
        return cached
    value = factory()
    cache.set(key, value, timeout=timeout)
    return value


def invalidate_session_cache() -> None:
    cache.delete(CACHE_KEY_CURRENT_SESSION_ID)
    cache.delete(CACHE_KEY_ACTIVE_SESSION)
    cache.delete(CACHE_KEY_SESSIONS_LIST.format(active_only=True))
    cache.delete(CACHE_KEY_SESSIONS_LIST.format(active_only=False))


def invalidate_user_permissions_cache(user_id: int) -> None:
    cache.delete(f"rbac:legacy_perms:{user_id}")
