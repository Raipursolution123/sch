import datetime
from typing import Any

from django.utils import timezone

from apps.academics.models import Classes, Subjects

ALLOWED_SUBJECT_TYPES = frozenset({"theory", "practical"})


def parse_linked_class_ids(raw: str | None) -> list[int]:
    if not raw:
        return []
    ids: list[int] = []
    for part in str(raw).split(","):
        part = part.strip()
        if not part:
            continue
        try:
            value = int(part)
        except ValueError:
            continue
        if value > 0 and value not in ids:
            ids.append(value)
    return ids


def format_linked_class(ids: list[int]) -> str | None:
    unique = sorted({int(i) for i in ids if int(i) > 0})
    return ",".join(str(i) for i in unique) if unique else None


def class_labels_for_ids(class_ids: list[int]) -> list[str]:
    if not class_ids:
        return []
    names = {c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)}
    return [names.get(cid, f"Class #{cid}") for cid in class_ids]


def subject_to_dict(subject: Subjects) -> dict[str, Any]:
    linked_ids = parse_linked_class_ids(subject.linked_class)
    return {
        "id": subject.id,
        "name": subject.name,
        "code": subject.code,
        "type": subject.type,
        "is_active": subject.is_active,
        "linked_class": subject.linked_class,
        "linked_class_ids": linked_ids,
        "linked_class_labels": class_labels_for_ids(linked_ids),
        "created_at": (
            subject.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if subject.created_at
            else None
        ),
        "updated_at": (
            subject.updated_at.strftime("%Y-%m-%d") if subject.updated_at else None
        ),
    }


def get_subject_by_id(subject_id: int) -> Subjects | None:
    try:
        return Subjects.objects.get(pk=subject_id)
    except Subjects.DoesNotExist:
        return None


def list_subjects(active_only: bool = False):
    qs = Subjects.objects.all().order_by("name", "id")
    if active_only:
        qs = qs.filter(is_active="yes")
    return qs


def today_date():
    return datetime.date.today()


def now_datetime():
    return timezone.now()
