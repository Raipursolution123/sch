import re
from typing import Any

from apps.settings.domain.general_settings_exceptions import (
    GeneralSettingsReadOnlyError,
    GeneralSettingsValidationError,
)

MVP_FIELDS = frozenset(
    {
        "name",
        "email",
        "phone",
        "address",
        "dise_code",
        "timezone",
        "date_format",
        "time_format",
        "start_month",
        "start_week",
        "day_off",
        "is_rtl",
        "attendence_type",
        "low_attendance_limit",
        "class_teacher",
        "currency",
        "currency_symbol",
        "currency_place",
        "collect_back_date_fees",
        "fee_due_days",
        "is_duplicate_fees_invoice",
        "maintenance_mode",
        "lock_grace_period",
        "student_panel_login",
        "parent_panel_login",
    }
)

READONLY_FIELDS = frozenset({"id", "session_id", "session", "updated_at", "created_at"})

TIMEZONE_ALLOWLIST = frozenset(
    {
        "Asia/Kolkata",
        "UTC",
        "Asia/Dubai",
        "Asia/Singapore",
        "Europe/London",
        "America/New_York",
    }
)

DATE_FORMAT_ALLOWLIST = frozenset({"d-m-Y", "m-d-Y", "Y-m-d", "d/m/Y", "d.M.Y"})

TIME_FORMAT_ALLOWLIST = frozenset({"12-hour", "24-hour"})

MONTH_ALLOWLIST = frozenset(
    {
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    }
)

WEEKDAY_ALLOWLIST = frozenset(
    {
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    }
)

CURRENCY_PLACE_ALLOWLIST = frozenset(
    {
        "before_number",
        "after_number",
        "before_with_space",
        "after_with_space",
    }
)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def reject_unknown_and_readonly(payload: dict[str, Any]) -> None:
    unknown = sorted(
        k for k in payload if k not in MVP_FIELDS and k not in READONLY_FIELDS
    )
    if unknown:
        raise GeneralSettingsValidationError(f"Unknown fields: {', '.join(unknown)}.")

    readonly = sorted(k for k in payload if k in READONLY_FIELDS)
    if readonly:
        raise GeneralSettingsReadOnlyError(
            f"Field is read-only: {', '.join(readonly)}."
        )


def _as_str(value: Any, field: str, *, max_len: int | None = None) -> str:
    if value is None:
        raise GeneralSettingsValidationError(f"{field} is required.")
    text = str(value).strip() if isinstance(value, str) else str(value)
    if max_len is not None and len(text) > max_len:
        raise GeneralSettingsValidationError(
            f"{field} must be at most {max_len} characters."
        )
    return text


def _as_int(value: Any, field: str, *, min_v: int, max_v: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError) as exc:
        raise GeneralSettingsValidationError(f"{field} must be an integer.") from exc
    if number < min_v or number > max_v:
        raise GeneralSettingsValidationError(
            f"{field} must be between {min_v} and {max_v}."
        )
    return number


def _as_float(value: Any, field: str, *, min_v: float, max_v: float) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise GeneralSettingsValidationError(f"{field} must be a number.") from exc
    if number < min_v or number > max_v:
        raise GeneralSettingsValidationError(
            f"{field} must be between {min_v} and {max_v}."
        )
    return number


def validate_and_normalize(payload: dict[str, Any]) -> dict[str, Any]:
    """Validate allowlisted PATCH payload and return normalized values."""
    reject_unknown_and_readonly(payload)
    cleaned: dict[str, Any] = {}

    if "name" in payload:
        name = _as_str(payload["name"], "name", max_len=100)
        if not name:
            raise GeneralSettingsValidationError("School name is required.")
        cleaned["name"] = name

    if "email" in payload:
        email = _as_str(payload["email"], "email", max_len=100)
        if email and not EMAIL_PATTERN.match(email):
            raise GeneralSettingsValidationError("Enter a valid email.")
        cleaned["email"] = email

    if "phone" in payload:
        cleaned["phone"] = _as_str(payload["phone"], "phone", max_len=50)

    if "address" in payload:
        address = payload["address"]
        text = "" if address is None else str(address)
        if len(text) > 5000:
            raise GeneralSettingsValidationError(
                "address must be at most 5000 characters."
            )
        cleaned["address"] = text

    if "dise_code" in payload:
        cleaned["dise_code"] = _as_str(payload["dise_code"], "dise_code", max_len=50)

    if "timezone" in payload:
        timezone = _as_str(payload["timezone"], "timezone")
        if timezone not in TIMEZONE_ALLOWLIST:
            raise GeneralSettingsValidationError("Invalid timezone.")
        cleaned["timezone"] = timezone

    if "date_format" in payload:
        date_format = _as_str(payload["date_format"], "date_format")
        if date_format not in DATE_FORMAT_ALLOWLIST:
            raise GeneralSettingsValidationError("Invalid date format.")
        cleaned["date_format"] = date_format

    if "time_format" in payload:
        time_format = _as_str(payload["time_format"], "time_format")
        if time_format not in TIME_FORMAT_ALLOWLIST:
            raise GeneralSettingsValidationError("Invalid time format.")
        cleaned["time_format"] = time_format

    if "start_month" in payload:
        start_month = _as_str(payload["start_month"], "start_month")
        month_name_map = {
            "January": "1", "February": "2", "March": "3", "April": "4",
            "May": "5", "June": "6", "July": "7", "August": "8",
            "September": "9", "October": "10", "November": "11", "December": "12",
        }
        if start_month in month_name_map.values():
            cleaned["start_month"] = start_month
        elif start_month in month_name_map:
            cleaned["start_month"] = month_name_map[start_month]
        else:
            raise GeneralSettingsValidationError("Invalid start month.")

    if "start_week" in payload:
        start_week = _as_str(payload["start_week"], "start_week")
        if start_week not in WEEKDAY_ALLOWLIST:
            raise GeneralSettingsValidationError("Invalid start week day.")
        cleaned["start_week"] = start_week

    if "day_off" in payload:
        cleaned["day_off"] = _as_str(payload["day_off"], "day_off", max_len=44)

    if "is_rtl" in payload:
        is_rtl = _as_str(payload["is_rtl"], "is_rtl")
        if is_rtl not in {"enabled", "disabled"}:
            raise GeneralSettingsValidationError(
                "is_rtl must be 'enabled' or 'disabled'."
            )
        cleaned["is_rtl"] = is_rtl

    if "attendence_type" in payload:
        cleaned["attendence_type"] = _as_int(
            payload["attendence_type"], "attendence_type", min_v=0, max_v=10
        )

    if "low_attendance_limit" in payload:
        cleaned["low_attendance_limit"] = _as_float(
            payload["low_attendance_limit"],
            "low_attendance_limit",
            min_v=0,
            max_v=100,
        )

    if "class_teacher" in payload:
        class_teacher = _as_str(payload["class_teacher"], "class_teacher")
        if class_teacher not in {"enabled", "disabled"}:
            raise GeneralSettingsValidationError(
                "class_teacher must be 'enabled' or 'disabled'."
            )
        cleaned["class_teacher"] = class_teacher

    if "currency" in payload:
        currency = _as_str(payload["currency"], "currency", max_len=50)
        if not currency:
            raise GeneralSettingsValidationError("Currency code is required.")
        cleaned["currency"] = currency

    if "currency_symbol" in payload:
        symbol = _as_str(payload["currency_symbol"], "currency_symbol", max_len=50)
        if not symbol:
            raise GeneralSettingsValidationError("Currency symbol is required.")
        cleaned["currency_symbol"] = symbol

    if "currency_place" in payload:
        place = _as_str(payload["currency_place"], "currency_place")
        if place not in CURRENCY_PLACE_ALLOWLIST:
            raise GeneralSettingsValidationError("Invalid currency placement.")
        cleaned["currency_place"] = place

    if "collect_back_date_fees" in payload:
        cleaned["collect_back_date_fees"] = _as_int(
            payload["collect_back_date_fees"],
            "collect_back_date_fees",
            min_v=0,
            max_v=1,
        )

    if "fee_due_days" in payload:
        cleaned["fee_due_days"] = _as_int(
            payload["fee_due_days"], "fee_due_days", min_v=0, max_v=365
        )

    if "is_duplicate_fees_invoice" in payload:
        dup = _as_str(payload["is_duplicate_fees_invoice"], "is_duplicate_fees_invoice")
        if dup not in {"0", "1"}:
            raise GeneralSettingsValidationError(
                "is_duplicate_fees_invoice must be '0' or '1'."
            )
        cleaned["is_duplicate_fees_invoice"] = dup

    if "maintenance_mode" in payload:
        cleaned["maintenance_mode"] = _as_int(
            payload["maintenance_mode"], "maintenance_mode", min_v=0, max_v=1
        )

    if "lock_grace_period" in payload:
        cleaned["lock_grace_period"] = _as_int(
            payload["lock_grace_period"], "lock_grace_period", min_v=0, max_v=365
        )

    if "student_panel_login" in payload:
        cleaned["student_panel_login"] = _as_int(
            payload["student_panel_login"], "student_panel_login", min_v=0, max_v=1
        )

    if "parent_panel_login" in payload:
        cleaned["parent_panel_login"] = _as_int(
            payload["parent_panel_login"], "parent_panel_login", min_v=0, max_v=1
        )

    if not cleaned:
        raise GeneralSettingsValidationError("No updatable fields provided.")

    return cleaned
