from collections import defaultdict
from typing import Any

from apps.academics.models import Classes, ClassSections, Sections
from apps.academics.selectors import section_selectors as section_sel


def is_hedu_program_bool(value) -> bool:
    return str(value).lower() in {"yes", "true", "1"}


def class_to_dict(
    class_obj: Classes, sections: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    return {
        "id": class_obj.id,
        "class_name": class_obj.class_field,
        "sort_order": class_obj.sort_order,
        "is_hedu_program": is_hedu_program_bool(class_obj.is_hedu_program),
        "is_active": class_obj.is_active,
        "sections": sections if sections is not None else [],
        "created_at": (
            class_obj.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if class_obj.created_at
            else None
        ),
        "updated_at": (
            class_obj.updated_at.strftime("%Y-%m-%d") if class_obj.updated_at else None
        ),
    }


def get_class_by_id(class_id: int) -> Classes | None:
    try:
        return Classes.objects.get(pk=class_id)
    except Classes.DoesNotExist:
        return None


def list_classes(active_only: bool = False):
    qs = Classes.objects.all().order_by("sort_order", "id")
    if active_only:
        qs = qs.filter(is_active="yes")
    return qs


def active_sections_for_classes(class_ids: list[int]) -> dict[int, list[dict]]:
    if not class_ids:
        return {}
    mappings = ClassSections.objects.filter(class_id__in=class_ids, is_active="yes")
    section_ids = {m.section_id for m in mappings if m.section_id}
    sections_dict = {
        s.id: s.section for s in Sections.objects.filter(id__in=section_ids)
    }
    result: dict[int, list[dict]] = defaultdict(list)
    for m in mappings:
        name = sections_dict.get(m.section_id)
        if name:
            result[m.class_id].append({"id": m.section_id, "section_name": name})
    return result


def active_sections_for_class(class_id: int) -> list[dict]:
    return active_sections_for_classes([class_id]).get(class_id, [])


def today_date():
    return section_sel.today_date()


def now_datetime():
    return section_sel.now_datetime()
