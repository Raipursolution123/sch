import json
from typing import Any

from apps.staff.models.department import Department
from apps.staff.models.staff import Staff
from apps.staff.models.staff_designation import StaffDesignation


def format_date(value) -> str | None:
    if not value:
        return None
    if isinstance(value, str):
        return value
    return value.strftime("%Y-%m-%d")


def department_name(dept_id: int | None) -> str:
    if dept_id is None:
        return "—"
    row = Department.objects.filter(pk=dept_id).first()
    return row.department_name if row else "—"


def designation_name(desig_id: int | None) -> str:
    if desig_id is None:
        return "—"
    row = StaffDesignation.objects.filter(pk=desig_id).first()
    return row.designation if row else "—"


def staff_full_name(staff: Staff) -> str:
    return " ".join(filter(None, [staff.name, staff.surname])).strip() or staff.name


def parse_docs(db_val: str | None, prefix: str) -> list[dict[str, Any]]:
    if not db_val:
        return []
    if db_val.startswith("["):
        try:
            return json.loads(db_val)
        except json.JSONDecodeError:
            pass
    paths = [p for p in str(db_val).split("|") if p.strip()]
    return [
        {"id": i + 1, "name": f"{prefix} {i + 1}", "file_path": p}
        for i, p in enumerate(paths)
    ]


def parse_other_docs(
    paths_val: str | None, names_val: str | None
) -> list[dict[str, Any]]:
    if not paths_val:
        return []
    if paths_val.startswith("["):
        try:
            return json.loads(paths_val)
        except json.JSONDecodeError:
            pass
    paths = [p for p in str(paths_val).split("|") if p.strip()]
    names = [n for n in str(names_val or "").split("|") if n.strip()]
    while len(names) < len(paths):
        names.append("Other Document")
    return [
        {"id": i + 1, "name": names[i], "file_path": p} for i, p in enumerate(paths)
    ]


def staff_list_item(staff: Staff) -> dict[str, Any]:
    return {
        "id": staff.id,
        "employee_id": staff.employee_id,
        "name": staff.name,
        "surname": staff.surname or "",
        "full_name": staff_full_name(staff),
        "email": staff.email or "",
        "contact_no": staff.contact_no or "",
        "gender": staff.gender or "",
        "department_id": staff.department,
        "department_name": department_name(staff.department),
        "designation_id": staff.designation,
        "designation_name": designation_name(staff.designation),
        "date_of_joining": format_date(staff.date_of_joining),
        "is_active": "yes" if staff.is_active == 1 else "no",
    }


def staff_detail(staff: Staff) -> dict[str, Any]:
    item = staff_list_item(staff)
    item.update(
        {
            "qualification": staff.qualification or "",
            "work_exp": staff.work_exp or "",
            "father_name": staff.father_name or "",
            "mother_name": staff.mother_name or "",
            "emergency_contact_no": staff.emergency_contact_no or "",
            "dob": format_date(staff.dob),
            "marital_status": staff.marital_status or "",
            "date_of_leaving": format_date(staff.date_of_leaving),
            "local_address": staff.local_address or "",
            "permanent_address": staff.permanent_address or "",
            "contract_type": staff.contract_type or "",
            "basic_salary": staff.basic_salary,
            "note": staff.note or "",
            "resume": parse_docs(staff.resume, "Resume"),
            "joining_letter": parse_docs(staff.joining_letter, "Joining Letter"),
            "resignation_letter": parse_docs(
                staff.resignation_letter, "Resignation Letter"
            ),
            "other_documents": parse_other_docs(
                staff.other_document_file, staff.other_document_name
            ),
            "updated_at": None,
        }
    )
    return item


def list_staff_qs():
    return Staff.objects.all().order_by("name", "surname")


def get_staff_by_id(staff_id: int) -> Staff | None:
    return Staff.objects.filter(pk=staff_id).first()


def list_departments():
    return Department.objects.all()


def list_designations():
    return StaffDesignation.objects.all()
