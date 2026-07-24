"""Helpers for masking and updating gateway/config secrets."""

from __future__ import annotations

from typing import Any


def mask_secret(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 4:
        return "****"
    return f"{'*' * (len(value) - 4)}{value[-4:]}"


def looks_masked(value: str) -> bool:
    return "*" in value


def resolve_secret(
    incoming: Any, current: str | None, *, allow_clear: bool = False
) -> str:
    """Keep current secret when payload omits/blank/masks the field."""
    if incoming is None:
        return current or ""
    text = str(incoming)
    if text == "":
        if allow_clear:
            return ""
        return current or ""
    if looks_masked(text):
        return current or ""
    return text


def as_yes_no(value: Any, *, default: str = "no") -> str:
    if isinstance(value, bool):
        return "yes" if value else "no"
    text = str(value or "").strip().lower()
    if text in {"1", "yes", "true", "enabled", "active"}:
        return "yes"
    if text in {"0", "no", "false", "disabled", "inactive"}:
        return "no"
    return default


def as_enabled_disabled(value: Any, *, default: str = "disabled") -> str:
    if isinstance(value, bool):
        return "enabled" if value else "disabled"
    text = str(value or "").strip().lower()
    if text in {"1", "yes", "true", "enabled", "active"}:
        return "enabled"
    if text in {"0", "no", "false", "disabled", "inactive"}:
        return "disabled"
    return default


def as_flag_str(value: Any, *, default: str = "0") -> str:
    if isinstance(value, bool):
        return "1" if value else "0"
    text = str(value or "").strip()
    if text in {"1", "yes", "true", "on"}:
        return "1"
    if text in {"0", "no", "false", "off", ""}:
        return "0"
    return default


def as_int_flag(value: Any, *, default: int = 0) -> int:
    if isinstance(value, bool):
        return 1 if value else 0
    try:
        return 1 if int(value) else 0
    except (TypeError, ValueError):
        return default
