from typing import Any

from apps.academics.models import Sessions
from apps.settings.models.sch_settings import SchSettings
from common.text_encoding import repair_utf8_cp1252_mojibake


def get_sch_settings() -> SchSettings | None:
    return SchSettings.objects.filter(id=1).first()


def resolve_session_label(session_id: int | None) -> str | None:
    if session_id is None:
        return None
    session = Sessions.objects.filter(pk=session_id).first()
    return session.session if session else None


def settings_to_dict(settings: SchSettings) -> dict[str, Any]:
    session_id = settings.session_id
    db_month = settings.start_month
    month_name_map = {
        "1": "January", "2": "February", "3": "March", "4": "April",
        "5": "May", "6": "June", "7": "July", "8": "August",
        "9": "September", "10": "October", "11": "November", "12": "December",
    }
    start_month = month_name_map.get(db_month, db_month) if db_month else "April"

    return {
        "id": settings.id,
        "name": settings.name or "",
        "email": settings.email or "",
        "phone": settings.phone or "",
        "address": settings.address or "",
        "dise_code": settings.dise_code or "",
        "timezone": settings.timezone or "UTC",
        "date_format": settings.date_format or "d-m-Y",
        "time_format": settings.time_format or "12-hour",
        "start_month": start_month,
        "start_week": settings.start_week or "Monday",
        "day_off": settings.day_off or "",
        "is_rtl": settings.is_rtl or "disabled",
        "attendence_type": settings.attendence_type or 0,
        "low_attendance_limit": settings.low_attendance_limit or 0,
        "class_teacher": settings.class_teacher or "disabled",
        "currency": settings.currency or "",
        "currency_symbol": repair_utf8_cp1252_mojibake(settings.currency_symbol),
        "currency_place": settings.currency_place or "before_number",
        "collect_back_date_fees": settings.collect_back_date_fees or 0,
        "fee_due_days": settings.fee_due_days or 0,
        "is_duplicate_fees_invoice": (
            str(settings.is_duplicate_fees_invoice)
            if settings.is_duplicate_fees_invoice is not None
            else "0"
        ),
        "maintenance_mode": settings.maintenance_mode or 0,
        "lock_grace_period": settings.lock_grace_period or 0,
        "student_panel_login": settings.student_panel_login or 0,
        "parent_panel_login": settings.parent_panel_login or 0,
        "session_id": session_id,
        "session": resolve_session_label(session_id),
        "updated_at": (
            settings.updated_at.strftime("%Y-%m-%d") if settings.updated_at else None
        ),
    }
