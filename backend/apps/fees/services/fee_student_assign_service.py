from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections
from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.fees.selectors import fee_selectors as selectors
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.models.student_session import StudentSession
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_selectors as student_selectors

logger = logging.getLogger(__name__)


class FeeStudentAssignService:
    """Map a fee session group (`fee_session_groups`) onto enrolled students."""

    def get_roster(
        self, *, fee_session_group_id: int, section_id: int | None = None
    ) -> dict[str, Any]:
        fsg = FeeSessionGroups.objects.filter(id=fee_session_group_id).first()
        if fsg is None:
            raise FeeNotFoundError("Fee assignment not found.")
        if not fsg.class_id or not fsg.session_id:
            raise FeeValidationError("Fee assignment is missing class or session.")

        school_class = Classes.objects.filter(id=fsg.class_id).first()
        assignment = selectors.assignment_to_dict(fsg)
        total_amount = float(assignment.get("total_amount") or 0)

        enrollments = StudentSession.objects.filter(
            session_id=fsg.session_id, class_id=fsg.class_id
        )
        if section_id:
            enrollments = enrollments.filter(section_id=section_id)
        enrollments = list(enrollments)
        student_ids = [e.student_id for e in enrollments if e.student_id]
        student_map = promotion_selectors.students_by_ids(student_ids)

        assigned = {
            row.student_session_id: row
            for row in StudentFeesMaster.objects.filter(
                fee_session_group_id=fee_session_group_id,
                student_session_id__in=[e.id for e in enrollments],
            )
        }

        section_ids = {e.section_id for e in enrollments if e.section_id}
        section_map = {
            s.id: s.section for s in Sections.objects.filter(id__in=section_ids)
        }

        rows = []
        for enrollment in enrollments:
            student = student_map.get(enrollment.student_id)
            if student is None or student.is_active != "yes":
                continue
            master = assigned.get(enrollment.id)
            rows.append(
                {
                    "student_id": student.id,
                    "student_session_id": enrollment.id,
                    "admission_no": student.admission_no,
                    "roll_no": student.roll_no,
                    "full_name": student_selectors.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "section_id": enrollment.section_id,
                    "section_name": section_map.get(enrollment.section_id, ""),
                    "assigned": master is not None and master.is_active == "yes",
                    "student_fees_master_id": master.id if master else None,
                }
            )

        rows.sort(
            key=lambda r: (
                r["section_name"] or "",
                (
                    int(r["roll_no"])
                    if r["roll_no"] is not None and str(r["roll_no"]).isdigit()
                    else 9999
                ),
                r["full_name"].lower(),
            )
        )

        return {
            "fee_session_group_id": fsg.id,
            "class_id": fsg.class_id,
            "class_name": school_class.class_field if school_class else "",
            "session_id": fsg.session_id,
            "assignment": assignment,
            "students": rows,
            "total_amount": total_amount,
        }

    def save_assignments(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            fee_session_group_id = int(payload.get("fee_session_group_id") or 0)
        except (TypeError, ValueError) as exc:
            raise FeeValidationError("fee_session_group_id is required.") from exc
        section_id = payload.get("section_id")
        parsed_section = int(section_id) if section_id not in (None, "") else None
        student_session_ids = payload.get("student_session_ids") or []
        if not fee_session_group_id:
            raise FeeValidationError("fee_session_group_id is required.")
        if not isinstance(student_session_ids, list):
            raise FeeValidationError("student_session_ids must be a list.")

        fsg = FeeSessionGroups.objects.filter(id=fee_session_group_id).first()
        if fsg is None:
            raise FeeNotFoundError("Fee assignment not found.")

        selected = {int(x) for x in student_session_ids if x}
        roster = self.get_roster(
            fee_session_group_id=fee_session_group_id, section_id=parsed_section
        )
        roster_ids = {row["student_session_id"] for row in roster["students"]}
        now = timezone.now()
        total_amount = float(roster.get("total_amount") or 0)

        with transaction.atomic():
            for student_session_id in roster_ids:
                existing = StudentFeesMaster.objects.filter(
                    student_session_id=student_session_id,
                    fee_session_group_id=fee_session_group_id,
                ).first()
                should_assign = student_session_id in selected
                if should_assign and existing is None:
                    StudentFeesMaster.objects.create(
                        is_system=0,
                        student_session_id=student_session_id,
                        fee_session_group_id=fee_session_group_id,
                        amount=total_amount,
                        is_active="yes",
                        created_at=now,
                    )
                elif should_assign and existing is not None:
                    existing.is_active = "yes"
                    existing.amount = total_amount
                    existing.save(update_fields=["is_active", "amount"])
                elif not should_assign and existing is not None:
                    existing.is_active = "no"
                    existing.save(update_fields=["is_active"])

        logger.info(
            "Saved fee student assignments fsg=%s selected=%s",
            fee_session_group_id,
            len(selected),
        )
        return self.get_roster(
            fee_session_group_id=fee_session_group_id, section_id=parsed_section
        )
