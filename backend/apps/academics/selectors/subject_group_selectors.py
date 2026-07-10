import datetime
from collections import defaultdict
from typing import Any

from django.utils import timezone

from apps.academics.models import (
    Classes,
    ClassSections,
    Sections,
    SubjectGroupClassSections,
    SubjectGroups,
    SubjectGroupSubjects,
    Subjects,
)
from apps.academics.models.sessions import Sessions


def get_group_by_id(group_id: int) -> SubjectGroups | None:
    try:
        return SubjectGroups.objects.get(pk=group_id)
    except SubjectGroups.DoesNotExist:
        return None


def list_groups(session_id: int | None = None):
    qs = SubjectGroups.objects.all().order_by("name", "id")
    if session_id is not None:
        qs = qs.filter(session_id=session_id)
    return qs


def session_name_map(session_ids: set[int]) -> dict[int, str]:
    if not session_ids:
        return {}
    return {s.id: s.session for s in Sessions.objects.filter(id__in=session_ids)}


def subject_rows_for_groups(group_ids: list[int]) -> dict[int, list[dict]]:
    if not group_ids:
        return {}
    rows = SubjectGroupSubjects.objects.filter(subject_group_id__in=group_ids)
    subject_ids = {r.subject_id for r in rows if r.subject_id}
    subjects = {s.id: s for s in Subjects.objects.filter(id__in=subject_ids)}
    result: dict[int, list[dict]] = defaultdict(list)
    for row in rows:
        subj = subjects.get(row.subject_id)
        if subj:
            result[row.subject_group_id].append(
                {
                    "id": subj.id,
                    "name": subj.name,
                    "code": subj.code,
                    "type": subj.type,
                }
            )
    return result


def active_class_section_rows_for_groups(
    group_ids: list[int],
) -> dict[int, list[dict]]:
    if not group_ids:
        return {}
    rows = SubjectGroupClassSections.objects.filter(
        subject_group_id__in=group_ids, is_active=1
    )
    cs_ids = {r.class_section_id for r in rows if r.class_section_id}
    mappings = {m.id: m for m in ClassSections.objects.filter(id__in=cs_ids)}
    class_ids = {m.class_id for m in mappings.values() if m.class_id}
    section_ids = {m.section_id for m in mappings.values() if m.section_id}
    class_names = {
        c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)
    }
    section_names = {
        s.id: s.section for s in Sections.objects.filter(id__in=section_ids)
    }
    result: dict[int, list[dict]] = defaultdict(list)
    for row in rows:
        mapping = mappings.get(row.class_section_id)
        if not mapping:
            continue
        result[row.subject_group_id].append(
            {
                "id": mapping.id,
                "class_id": mapping.class_id,
                "section_id": mapping.section_id,
                "class_name": class_names.get(mapping.class_id),
                "section_name": section_names.get(mapping.section_id),
            }
        )
    return result


def group_list_item_dict(group: SubjectGroups) -> dict[str, Any]:
    session_names = session_name_map({group.session_id} if group.session_id else set())
    subject_count = SubjectGroupSubjects.objects.filter(
        subject_group_id=group.id
    ).count()
    class_section_count = SubjectGroupClassSections.objects.filter(
        subject_group_id=group.id, is_active=1
    ).count()
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "session_id": group.session_id,
        "session_name": session_names.get(group.session_id),
        "subject_count": subject_count,
        "class_section_count": class_section_count,
        "created_at": (
            group.created_at.strftime("%Y-%m-%d %H:%M:%S") if group.created_at else None
        ),
    }


def group_detail_dict(group: SubjectGroups) -> dict[str, Any]:
    base = group_list_item_dict(group)
    subjects = subject_rows_for_groups([group.id]).get(group.id, [])
    class_sections = active_class_section_rows_for_groups([group.id]).get(group.id, [])
    base["subjects"] = subjects
    base["subject_ids"] = [s["id"] for s in subjects]
    base["class_sections"] = class_sections
    base["class_section_ids"] = [cs["id"] for cs in class_sections]
    return base


def today_date():
    return datetime.date.today()


def now_datetime():
    return timezone.now()
