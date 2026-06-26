"""Legacy password verification — db_current stores predominantly plaintext."""

import hashlib


def verify_legacy_password(raw_password: str, stored_password: str | None) -> bool:
    if stored_password is None or raw_password is None:
        return False

    if raw_password == stored_password:
        return True

    # Legacy fallbacks observed in a small minority of rows
    hashed_candidates = {
        hashlib.md5(raw_password.encode("utf-8")).hexdigest(),
        hashlib.sha1(raw_password.encode("utf-8")).hexdigest(),
    }
    return stored_password in hashed_candidates


def hash_legacy_password(raw_password: str) -> str:
    """Store as plaintext to match dominant legacy ERP pattern (varchar 50)."""
    return raw_password[:50]
