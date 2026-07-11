from typing import Any

from apps.academics.models import Classes, Sections
from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.students.domain.student_exceptions import StudentError
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as selectors
from apps.students.services.student_fee_service import StudentFeeService


class FeeCollectService:
    def get_roster(self, class_id: int, section_id: int) -> dict[str, Any]:
        active_session = selectors.get_active_session()
        if not active_session:
            raise FeeValidationError("No active academic session found.")

        if not selectors.class_section_mapping_active(class_id, section_id):
            raise FeeValidationError(
                "Class and section are not assigned to each other."
            )

        school_class = Classes.objects.filter(id=class_id, is_active="yes").first()
        section = Sections.objects.filter(id=section_id, is_active="yes").first()
        if not school_class or not section:
            raise FeeValidationError("Class or section not found.")

        enrollments = promotion_selectors.list_source_enrollments(
            active_session.id, class_id, section_id
        )
        student_ids = [row.student_id for row in enrollments if row.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        fee_service = StudentFeeService()
        students: list[dict[str, Any]] = []

        for enrollment in enrollments:
            student = student_map.get(enrollment.student_id)
            if not student or student.is_active != "yes":
                continue

            total_due = 0.0
            total_paid = 0.0
            total_balance = 0.0
            try:
                summary = fee_service.get_fee_summary(student.id)
                total_due = float(summary["total_due"])
                total_paid = float(summary["total_paid"])
                total_balance = float(summary["total_balance"])
            except StudentError:
                pass

            students.append(
                {
                    "student_id": student.id,
                    "admission_no": student.admission_no,
                    "roll_no": student.roll_no,
                    "full_name": selectors.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "total_due": total_due,
                    "total_paid": total_paid,
                    "total_balance": total_balance,
                }
            )

        students.sort(
            key=lambda row: (
                (
                    int(row["roll_no"])
                    if row["roll_no"] is not None and str(row["roll_no"]).isdigit()
                    else 9999
                ),
                row["full_name"].lower(),
            )
        )

        return {
            "class_id": class_id,
            "class_name": school_class.class_field,
            "section_id": section_id,
            "section_name": section.section,
            "session_name": active_session.session,
            "students": students,
        }
