import datetime
from typing import Any

from django.utils import timezone

from apps.academics.models import Sessions
from apps.settings.models.sch_settings import SchSettings


def get_current_session_id() -> int | None:
    settings = SchSettings.objects.filter(id=1).first()
    if settings is None or settings.session_id is None:
        return None
    return settings.session_id


def session_to_dict(
    session: Sessions, current_session_id: int | None = None
) -> dict[str, Any]:
    if current_session_id is None:
        current_session_id = get_current_session_id()
    return {
        "id": session.id,
        "session": session.session,
        "is_active": session.is_active,
        "is_current": session.id == current_session_id,
        "created_at": (
            session.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if session.created_at
            else None
        ),
        "updated_at": (
            session.updated_at.strftime("%Y-%m-%d") if session.updated_at else None
        ),
    }


def get_session_by_id(session_id: int) -> Sessions | None:
    try:
        return Sessions.objects.get(pk=session_id)
    except Sessions.DoesNotExist:
        return None


def list_sessions(active_only: bool = False):
    qs = Sessions.objects.all().order_by("id")
    if active_only:
        qs = qs.filter(is_active="yes")
    return qs


def get_current_session() -> Sessions | None:
    current_id = get_current_session_id()
    if current_id is not None:
        session = get_session_by_id(current_id)
        if session is not None:
            return session
    return Sessions.objects.filter(is_active="yes").order_by("-id").first()


def count_sessions() -> int:
    return Sessions.objects.count()


def update_sch_settings_session_id(session_id: int) -> None:
    settings = SchSettings.objects.filter(id=1).first()
    if settings is None:
        return
    settings.session_id = session_id
    settings.updated_at = datetime.date.today()
    settings.save(update_fields=["session_id", "updated_at"])


def today_date():
    return datetime.date.today()


def now_datetime():
    return timezone.now()
