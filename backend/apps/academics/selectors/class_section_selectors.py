from typing import Any

from apps.academics.models import Classes, ClassSections, Sections
from apps.academics.selectors import section_selectors as section_sel


def mapping_to_dict(
    mapping: ClassSections,
    *,
    class_name: str | None = None,
    section_name: str | None = None,
) -> dict[str, Any]:
    if class_name is None and mapping.class_id:
        class_obj = Classes.objects.filter(id=mapping.class_id).first()
        class_name = class_obj.class_field if class_obj else None
    if section_name is None and mapping.section_id:
        section_obj = Sections.objects.filter(id=mapping.section_id).first()
        section_name = section_obj.section if section_obj else None

    return {
        "id": mapping.id,
        "class_id": mapping.class_id,
        "class_name": class_name,
        "section_id": mapping.section_id,
        "section_name": section_name,
        "is_active": mapping.is_active,
        "created_at": (
            mapping.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if mapping.created_at
            else None
        ),
        "updated_at": (
            mapping.updated_at.strftime("%Y-%m-%d") if mapping.updated_at else None
        ),
    }


def get_mapping_by_id(mapping_id: int) -> ClassSections | None:
    try:
        return ClassSections.objects.get(pk=mapping_id)
    except ClassSections.DoesNotExist:
        return None


def list_mappings(active_only: bool = False):
    qs = ClassSections.objects.all().order_by("id")
    if active_only:
        qs = qs.filter(is_active="yes")
    return qs


def get_mapping_by_pair(class_id: int, section_id: int) -> ClassSections | None:
    return ClassSections.objects.filter(
        class_id=class_id, section_id=section_id
    ).first()


def today_date():
    return section_sel.today_date()


def now_datetime():
    return section_sel.now_datetime()
