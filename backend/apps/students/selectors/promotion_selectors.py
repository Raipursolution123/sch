from typing import Any

from apps.academics.models import Classes, ClassSections, Sections, SubjectGroupClassSections
from apps.academics.models.subject_groups import SubjectGroups
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.models.student_session import StudentSession
from apps.students.models.students import Students


def _student_name(student: Students) -> str:
    parts = [student.firstname, student.middlename, student.lastname]
    return " ".join(p.strip() for p in parts if p and str(p).strip())


def list_source_enrollments(
    session_id: int, class_id: int, section_id: int
) -> list[StudentSession]:
    return list(
        StudentSession.objects.filter(
            session_id=session_id,
            class_id=class_id,
            section_id=section_id,
            is_active="yes",
        ).order_by("student_id")
    )


def target_student_ids(session_id: int) -> set[int]:
    rows = StudentSession.objects.filter(session_id=session_id).values_list(
        "student_id", flat=True
    )
    return {sid for sid in rows if sid}


def students_by_ids(student_ids: list[int]) -> dict[int, Students]:
    if not student_ids:
        return {}
    return {s.id: s for s in Students.objects.filter(id__in=student_ids)}


def class_section_id(class_id: int, section_id: int) -> int | None:
    mapping = ClassSections.objects.filter(
        class_id=class_id, section_id=section_id, is_active="yes"
    ).first()
    return mapping.id if mapping else None


def class_label(class_id: int | None) -> str | None:
    if not class_id:
        return None
    row = Classes.objects.filter(id=class_id).first()
    return row.class_field if row else None


def section_label(section_id: int | None) -> str | None:
    if not section_id:
        return None
    row = Sections.objects.filter(id=section_id).first()
    return row.section if row else None


def has_active_fees(student_session_id: int) -> bool:
    return StudentFeesMaster.objects.filter(
        student_session_id=student_session_id, is_active="yes"
    ).exists()


def subject_group_valid_for_target(
    subject_group_id: int, session_id: int, class_section_id: int
) -> bool:
    group = SubjectGroups.objects.filter(id=subject_group_id, session_id=session_id).first()
    if group is None:
        return False
    return SubjectGroupClassSections.objects.filter(
        subject_group_id=subject_group_id,
        session_id=session_id,
        class_section_id=class_section_id,
        is_active=1,
    ).exists()


def enrollment_preview_row(
    enrollment: StudentSession,
    student: Students | None,
    *,
    in_target: bool,
    class_name: str | None,
    section_name: str | None,
    fee_warning: bool,
) -> dict[str, Any]:
    blockers: list[str] = []
    if student is None:
        blockers.append("Student record not found.")
    elif student.is_active != "yes":
        blockers.append("Student is inactive.")
    if in_target:
        blockers.append("Already enrolled in target session.")

    return {
        "student_id": enrollment.student_id,
        "student_session_id": enrollment.id,
        "admission_no": student.admission_no if student else None,
        "name": _student_name(student) if student else None,
        "current_class_name": class_name,
        "current_section_name": section_name,
        "eligible": len(blockers) == 0,
        "blockers": blockers,
        "fee_warning": fee_warning,
    }
