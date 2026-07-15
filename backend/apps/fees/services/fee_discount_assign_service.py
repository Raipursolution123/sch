import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections
from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.models.fees_discounts import FeesDiscounts
from apps.students.models.student_fees_discounts import StudentFeesDiscounts
from apps.students.models.student_session import StudentSession
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as selectors

logger = logging.getLogger(__name__)


class FeeDiscountAssignService:
    def get_roster(
        self, class_id: int, section_id: int, fees_discount_id: int
    ) -> dict[str, Any]:
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

        discount = self._require_discount(fees_discount_id, active_session.id)

        enrollments = promotion_selectors.list_source_enrollments(
            active_session.id, class_id, section_id
        )
        student_ids = [row.student_id for row in enrollments if row.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        enrollment_ids = [row.id for row in enrollments]
        assignment_map = {
            row.student_session_id: row
            for row in StudentFeesDiscounts.objects.filter(
                student_session_id__in=enrollment_ids,
                fees_discount_id=fees_discount_id,
                is_active="yes",
            )
        }

        students: list[dict[str, Any]] = []
        for enrollment in enrollments:
            student = student_map.get(enrollment.student_id)
            if not student or student.is_active != "yes":
                continue

            assignment = assignment_map.get(enrollment.id)
            students.append(
                {
                    "student_id": student.id,
                    "student_session_id": enrollment.id,
                    "admission_no": student.admission_no,
                    "roll_no": student.roll_no,
                    "full_name": selectors.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "is_assigned": assignment is not None,
                    "assignment_id": assignment.id if assignment else None,
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
            "fees_discount_id": discount.id,
            "discount_name": discount.name,
            "discount_code": discount.code,
            "class_id": class_id,
            "class_name": school_class.class_field,
            "section_id": section_id,
            "section_name": section.section,
            "session_id": active_session.id,
            "session_name": active_session.session,
            "students": students,
        }

    def assign(
        self,
        *,
        fees_discount_id: int,
        student_session_ids: list[int],
        description: str | None = None,
    ) -> dict[str, Any]:
        if not student_session_ids:
            raise FeeValidationError("Select at least one student.")

        active_session = selectors.get_active_session()
        if not active_session:
            raise FeeValidationError("No active academic session found.")

        discount = self._require_discount(fees_discount_id, active_session.id)
        unique_ids = sorted({int(sid) for sid in student_session_ids})

        enrollments = list(
            StudentSession.objects.filter(
                id__in=unique_ids,
                session_id=active_session.id,
                is_active="yes",
            )
        )
        if len(enrollments) != len(unique_ids):
            raise FeeValidationError(
                "One or more selected students are not enrolled in the active session."
            )

        existing = {
            row.student_session_id
            for row in StudentFeesDiscounts.objects.filter(
                fees_discount_id=discount.id,
                student_session_id__in=unique_ids,
                is_active="yes",
            )
        }

        created_count = 0
        skipped_count = 0
        with transaction.atomic():
            for enrollment in enrollments:
                if enrollment.id in existing:
                    skipped_count += 1
                    continue
                StudentFeesDiscounts.objects.create(
                    student_session_id=enrollment.id,
                    fees_discount_id=discount.id,
                    status="assigned",
                    payment_id=None,
                    description=description,
                    is_active="yes",
                    created_at=timezone.now(),
                )
                created_count += 1

        logger.info(
            "Assigned discount id=%s created=%s skipped=%s",
            discount.id,
            created_count,
            skipped_count,
        )
        return {
            "fees_discount_id": discount.id,
            "assigned_count": created_count,
            "skipped_count": skipped_count,
        }

    def unassign(self, assignment_id: int) -> None:
        assignment = StudentFeesDiscounts.objects.filter(id=assignment_id).first()
        if assignment is None or assignment.is_active != "yes":
            raise FeeNotFoundError("Discount assignment not found.")

        assignment.is_active = "no"
        assignment.save(update_fields=["is_active"])
        logger.info("Unassigned discount assignment id=%s", assignment_id)

    def _require_discount(
        self, fees_discount_id: int, session_id: int
    ) -> FeesDiscounts:
        discount = FeesDiscounts.objects.filter(id=fees_discount_id).first()
        if discount is None:
            raise FeeNotFoundError("Fee discount not found.")
        if discount.is_active != "yes":
            raise FeeValidationError("Selected discount is not active.")
        if discount.session_id and discount.session_id != session_id:
            raise FeeValidationError(
                "Selected discount does not belong to the active session."
            )
        return discount
