from typing import Any

from django.utils import timezone

from apps.academics.models import Classes, ClassSections, Sections, Sessions
from apps.academics.selectors.session_selectors import get_current_session
from apps.students.models.disable_reason import DisableReason
from apps.students.models.student_session import StudentSession
from apps.students.models.students import Students


def now_datetime():
    return timezone.now()


def today_date():
    return timezone.now().date()


def safe_date_str(value, fmt="%Y-%m-%d") -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return value.strftime(fmt)
    except Exception:
        return str(value)


def format_student_name(first, middle, last) -> str:
    parts = [first]
    if middle:
        parts.append(middle)
    if last:
        parts.append(last)
    return " ".join(p.strip() for p in parts if p and p.strip())


def get_active_session() -> Sessions | None:
    return get_current_session()


def list_students_qs(*, status: str = "active"):
    qs = Students.objects.all()
    if status == "active":
        qs = qs.filter(is_active="yes")
    elif status == "disabled":
        qs = qs.exclude(is_active="yes")
    return qs.order_by("-id")


def get_disable_reason_by_id(reason_id: int) -> DisableReason | None:
    return DisableReason.objects.filter(id=reason_id).first()


def list_disable_reasons() -> list[dict[str, Any]]:
    return [
        {"id": row.id, "reason": row.reason}
        for row in DisableReason.objects.all().order_by("reason")
    ]


def get_student_by_id(student_id: int) -> Students | None:
    return Students.objects.filter(id=student_id).first()


def get_enrollment_for_session(
    student_id: int, session_id: int
) -> StudentSession | None:
    return StudentSession.objects.filter(
        session_id=session_id, student_id=student_id
    ).first()


def enrollments_for_students(
    session_id: int, student_ids: list[int]
) -> dict[int, StudentSession]:
    rows = StudentSession.objects.filter(
        session_id=session_id, student_id__in=student_ids
    )
    return {row.student_id: row for row in rows}


def class_labels(class_ids: list[int]) -> dict[int, str]:
    return {c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)}


def section_labels(section_ids: list[int]) -> dict[int, str]:
    return {s.id: s.section for s in Sections.objects.filter(id__in=section_ids)}


def class_section_mapping_active(class_id: int, section_id: int) -> bool:
    mapping = ClassSections.objects.filter(
        class_id=class_id, section_id=section_id, is_active="yes"
    ).first()
    return mapping is not None


def disable_reason_labels(reason_ids: list[int]) -> dict[int, str]:
    if not reason_ids:
        return {}
    return {
        row.id: row.reason for row in DisableReason.objects.filter(id__in=reason_ids)
    }


def disable_reason_name(reason_id: int | None) -> str | None:
    if not reason_id:
        return None
    reason = DisableReason.objects.filter(id=reason_id).first()
    return reason.reason if reason else None


def student_list_item(
    student: Students,
    *,
    class_id: int | None = None,
    section_id: int | None = None,
    class_name: str | None = None,
    section_name: str | None = None,
    disable_reason_label: str | None = None,
) -> dict[str, Any]:
    resolved_disable_reason = disable_reason_label
    if resolved_disable_reason is None and student.dis_reason:
        resolved_disable_reason = disable_reason_name(student.dis_reason)

    return {
        "id": student.id,
        "admission_no": student.admission_no,
        "roll_no": student.roll_no,
        "firstname": student.firstname,
        "middlename": student.middlename,
        "lastname": student.lastname,
        "full_name": format_student_name(
            student.firstname, student.middlename, student.lastname
        ),
        "gender": student.gender,
        "mobileno": student.mobileno,
        "email": student.email,
        "dob": safe_date_str(student.dob),
        "is_active": student.is_active,
        "class_id": class_id,
        "section_id": section_id,
        "class_name": class_name,
        "section_name": section_name,
        "admission_date": safe_date_str(student.admission_date),
        "created_at": safe_date_str(student.created_at, "%Y-%m-%dT%H:%M:%SZ"),
        "disable_reason_id": student.dis_reason or None,
        "disable_reason_name": resolved_disable_reason,
        "disable_note": student.dis_note or None,
        "disabled_at": safe_date_str(student.disable_at),
    }


def student_detail(
    student: Students,
    *,
    class_id: int | None = None,
    section_id: int | None = None,
    class_name: str | None = None,
    section_name: str | None = None,
) -> dict[str, Any]:
    data = student_list_item(
        student,
        class_id=class_id,
        section_id=section_id,
        class_name=class_name,
        section_name=section_name,
    )
    data.update(
        {
            "father_name": student.father_name,
            "father_phone": student.father_phone,
            "father_occupation": student.father_occupation,
            "mother_name": student.mother_name,
            "mother_phone": student.mother_phone,
            "mother_occupation": student.mother_occupation,
            "guardian_name": student.guardian_name,
            "guardian_relation": student.guardian_relation,
            "guardian_phone": student.guardian_phone,
            "guardian_occupation": student.guardian_occupation,
            "guardian_address": student.guardian_address,
            "guardian_email": student.guardian_email,
            "guardian_is": student.guardian_is,
            "current_address": student.current_address,
            "permanent_address": student.permanent_address,
            "blood_group": student.blood_group,
            "religion": student.religion,
            "cast": student.cast,
            "category_id": student.category_id,
            "school_house_id": student.school_house_id,
            "hostel_room_id": student.hostel_room_id,
            "room_bed_id": student.room_bed_id,
            "adhar_no": student.adhar_no,
            "samagra_id": student.samagra_id,
            "bank_account_no": student.bank_account_no,
            "bank_name": student.bank_name,
            "ifsc_code": student.ifsc_code,
            "previous_school": student.previous_school,
            "height": student.height,
            "weight": student.weight,
            "measurement_date": safe_date_str(student.measurement_date),
            "note": student.note,
            "rte": student.rte,
            "updated_at": safe_date_str(student.updated_at),
        }
    )
    return data


def resolve_class_section_names(
    class_id: int | None, section_id: int | None
) -> tuple[str | None, str | None]:
    class_name = None
    section_name = None
    if class_id:
        class_obj = Classes.objects.filter(id=class_id).first()
        if class_obj:
            class_name = class_obj.class_field
    if section_id:
        section_obj = Sections.objects.filter(id=section_id).first()
        if section_obj:
            section_name = section_obj.section
    return class_name, section_name
