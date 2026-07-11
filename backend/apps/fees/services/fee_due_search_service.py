from typing import Any

from apps.academics.models import Classes, Sections
from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.selectors import fee_search_selectors as search_selectors
from apps.students.domain.student_exceptions import StudentError
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as selectors
from apps.students.services.student_fee_service import StudentFeeService


class FeeDueSearchService:
    def search_due_fees(
        self,
        *,
        class_id: int | None = None,
        section_id: int | None = None,
        query: str | None = None,
        min_balance: float = 0.01,
    ) -> dict[str, Any]:
        active_session = selectors.get_active_session()
        if not active_session:
            raise FeeValidationError("No active academic session found.")

        if (
            class_id
            and section_id
            and not selectors.class_section_mapping_active(class_id, section_id)
        ):
            raise FeeValidationError(
                "Class and section are not assigned to each other."
            )

        enrollments = search_selectors.list_session_enrollments(
            active_session.id,
            class_id=class_id,
            section_id=section_id,
        )
        student_ids = [row.student_id for row in enrollments if row.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        class_ids = {row.class_id for row in enrollments if row.class_id}
        section_ids = {row.section_id for row in enrollments if row.section_id}
        class_labels = selectors.class_labels(list(class_ids))
        section_labels = selectors.section_labels(list(section_ids))

        fee_service = StudentFeeService()
        query_value = (query or "").strip().lower()
        students: list[dict[str, Any]] = []

        for enrollment in enrollments:
            student = student_map.get(enrollment.student_id)
            if not student or student.is_active != "yes":
                continue

            if query_value and not self._matches_query(student, query_value):
                continue

            try:
                summary = fee_service.get_fee_summary(student.id)
            except StudentError:
                continue

            total_balance = float(summary["total_balance"])
            if total_balance < min_balance:
                continue

            students.append(
                {
                    "student_id": student.id,
                    "admission_no": student.admission_no,
                    "roll_no": student.roll_no,
                    "full_name": selectors.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "class_id": enrollment.class_id,
                    "class_name": (
                        class_labels.get(enrollment.class_id, "—")
                        if enrollment.class_id
                        else "—"
                    ),
                    "section_id": enrollment.section_id,
                    "section_name": (
                        section_labels.get(enrollment.section_id, "—")
                        if enrollment.section_id
                        else "—"
                    ),
                    "total_due": float(summary["total_due"]),
                    "total_paid": float(summary["total_paid"]),
                    "total_balance": total_balance,
                }
            )

        students.sort(
            key=lambda row: (
                -row["total_balance"],
                row["class_name"],
                row["section_name"],
                (
                    int(row["roll_no"])
                    if row["roll_no"] is not None and str(row["roll_no"]).isdigit()
                    else 9999
                ),
            )
        )

        return {
            "session_name": active_session.session,
            "class_id": class_id,
            "class_name": self._optional_class_name(class_id),
            "section_id": section_id,
            "section_name": self._optional_section_name(section_id),
            "total_students": len(students),
            "total_balance": sum(row["total_balance"] for row in students),
            "students": students,
        }

    @staticmethod
    def _matches_query(student, query_value: str) -> bool:
        admission = (student.admission_no or "").lower()
        if query_value in admission:
            return True
        full_name = selectors.format_student_name(
            student.firstname, student.middlename, student.lastname
        ).lower()
        return query_value in full_name

    @staticmethod
    def _optional_class_name(class_id: int | None) -> str | None:
        if not class_id:
            return None
        row = Classes.objects.filter(id=class_id).first()
        return row.class_field if row else None

    @staticmethod
    def _optional_section_name(section_id: int | None) -> str | None:
        if not section_id:
            return None
        row = Sections.objects.filter(id=section_id).first()
        return row.section if row else None
