import datetime
from typing import Any

from django.utils import timezone

from apps.academics.models import Sections


def section_to_dict(section: Sections) -> dict[str, Any]:
    return {
        "id": section.id,
        "section_name": section.section,
        "is_active": section.is_active,
        "created_at": (
            section.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if section.created_at
            else None
        ),
        "updated_at": (
            section.updated_at.strftime("%Y-%m-%d") if section.updated_at else None
        ),
    }


def get_section_by_id(section_id: int) -> Sections | None:
    try:
        return Sections.objects.get(pk=section_id)
    except Sections.DoesNotExist:
        return None


def list_sections(active_only: bool = False):
    qs = Sections.objects.all().order_by("id")
    if active_only:
        qs = qs.filter(is_active="yes")
    return qs


def today_date():
    return datetime.date.today()


def now_datetime():
    return timezone.now()
