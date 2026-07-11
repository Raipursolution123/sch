import re

from apps.academics.domain.session_exceptions import SessionValidationError
from apps.academics.models import Sessions

SESSION_NAME_PATTERN = re.compile(r"^(\d{4})\s*-\s*(\d{2})$")


def normalize_session_name(raw: str) -> str:
    return str(raw).strip()


def validate_session_name(raw: str) -> str:
    """Validate YYYY-YY format and return canonical name."""
    session_name = normalize_session_name(raw)
    if not session_name:
        raise SessionValidationError("Session name is required.")

    match = SESSION_NAME_PATTERN.match(session_name)
    if not match:
        raise SessionValidationError(
            "Session must be in format YYYY-YY (e.g., 2026-27)."
        )

    start_year = int(match.group(1))
    end_year_suffix = int(match.group(2))
    end_year = int(f"{str(start_year)[:2]}{end_year_suffix:02d}")

    if end_year - start_year != 1:
        raise SessionValidationError("Session not allowed.")

    return f"{start_year}-{end_year_suffix:02d}"


def ensure_unique_session_name(name: str, exclude_id: int | None = None) -> None:
    qs = Sessions.objects.filter(session__iexact=name)
    if exclude_id is not None:
        qs = qs.exclude(pk=exclude_id)
    if qs.exists():
        raise SessionValidationError(f"Session '{name}' already exists.")
