from typing import Any

from apps.academics.models import ClassSections, Classes, ClassTeacher, Sections
from apps.academics.models.sessions import Sessions
from apps.academics.selectors import class_section_selectors as cs_sel
from apps.staff.models import Staff


def _staff_display(staff: Staff | None) -> tuple[str | None, str | None]:
    if staff is None:
        return None, None
    name = staff.name.strip()
    surname = (staff.surname or "").strip()
    full_name = f"{name} {surname}".strip() or name
    return full_name, staff.employee_id


def assignment_to_dict(
    assignment: ClassTeacher,
    *,
    session_label: str | None = None,
    class_name: str | None = None,
    section_name: str | None = None,
    staff_name: str | None = None,
    staff_employee_id: str | None = None,
    class_section_id: int | None = None,
) -> dict[str, Any]:
    if session_label is None and assignment.session_id:
        session = Sessions.objects.filter(id=assignment.session_id).first()
        session_label = session.session if session else None
    if class_name is None and assignment.class_id:
        class_obj = Classes.objects.filter(id=assignment.class_id).first()
        class_name = class_obj.class_field if class_obj else None
    if section_name is None and assignment.section_id:
        section_obj = Sections.objects.filter(id=assignment.section_id).first()
        section_name = section_obj.section if section_obj else None
    if staff_name is None or staff_employee_id is None:
        staff = Staff.objects.filter(id=assignment.staff_id).first()
        if staff:
            staff_name, staff_employee_id = _staff_display(staff)
    if class_section_id is None:
        mapping = cs_sel.get_mapping_by_pair(assignment.class_id, assignment.section_id)
        class_section_id = mapping.id if mapping else None

    return {
        "id": assignment.id,
        "class_section_id": class_section_id,
        "session_id": assignment.session_id,
        "class_id": assignment.class_id,
        "section_id": assignment.section_id,
        "staff_id": assignment.staff_id,
        "session_label": session_label,
        "class_name": class_name,
        "section_name": section_name,
        "staff_name": staff_name,
        "staff_employee_id": staff_employee_id,
    }


def unassigned_row_dict(
    *,
    session_id: int,
    session_label: str | None,
    mapping: ClassSections,
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
        "id": None,
        "class_section_id": mapping.id,
        "session_id": session_id,
        "class_id": mapping.class_id,
        "section_id": mapping.section_id,
        "staff_id": None,
        "session_label": session_label,
        "class_name": class_name,
        "section_name": section_name,
        "staff_name": None,
        "staff_employee_id": None,
    }


def get_assignment_by_id(assignment_id: int) -> ClassTeacher | None:
    try:
        return ClassTeacher.objects.get(pk=assignment_id)
    except ClassTeacher.DoesNotExist:
        return None


def get_assignment_by_scope(
    session_id: int, class_id: int, section_id: int
) -> ClassTeacher | None:
    return ClassTeacher.objects.filter(
        session_id=session_id, class_id=class_id, section_id=section_id
    ).first()


def list_assignments_for_session(
    session_id: int,
    class_id: int | None = None,
    section_id: int | None = None,
) -> list[ClassTeacher]:
    qs = ClassTeacher.objects.filter(session_id=session_id).order_by(
        "class_id", "section_id"
    )
    if class_id is not None:
        qs = qs.filter(class_id=class_id)
    if section_id is not None:
        qs = qs.filter(section_id=section_id)
    return list(qs)
