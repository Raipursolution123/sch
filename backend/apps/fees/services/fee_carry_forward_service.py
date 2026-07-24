from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections
from apps.academics.models.sessions import Sessions
from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.models.student_session import StudentSession
from apps.students.selectors import promotion_selectors
from apps.students.selectors import student_fee_selectors as fee_selectors
from apps.students.selectors import student_selectors as student_selectors

logger = logging.getLogger(__name__)


class FeeCarryForwardService:
    """Carry unpaid prior-session balances into the target session enrollment."""

    def preview(
        self,
        *,
        from_session_id: int,
        to_session_id: int,
        class_id: int,
        section_id: int,
    ) -> dict[str, Any]:
        self._validate_ids(from_session_id, to_session_id, class_id, section_id)
        if from_session_id == to_session_id:
            raise FeeValidationError("From and to sessions must be different.")

        from_session = Sessions.objects.filter(id=from_session_id).first()
        to_session = Sessions.objects.filter(id=to_session_id).first()
        if from_session is None or to_session is None:
            raise FeeNotFoundError("Session not found.")

        school_class = Classes.objects.filter(id=class_id).first()
        section = Sections.objects.filter(id=section_id).first()
        if school_class is None or section is None:
            raise FeeNotFoundError("Class or section not found.")

        from_enrollments = {
            e.student_id: e
            for e in StudentSession.objects.filter(
                session_id=from_session_id, class_id=class_id, section_id=section_id
            )
            if e.student_id
        }
        to_enrollments = {
            e.student_id: e
            for e in StudentSession.objects.filter(session_id=to_session_id)
            if e.student_id
        }

        student_ids = list(from_enrollments.keys())
        student_map = promotion_selectors.students_by_ids(student_ids)
        from_totals = fee_selectors.batch_fee_totals_for_roster(
            [e.id for e in from_enrollments.values()], class_id, from_session_id
        )

        # Existing carry-forward masters on target enrollments for this class context
        to_session_ids = [e.id for e in to_enrollments.values()]
        existing_cf = {
            row.student_session_id
            for row in StudentFeesMaster.objects.filter(
                student_session_id__in=to_session_ids,
                is_system=1,
                is_active="yes",
            )
        }

        rows = []
        for student_id, from_enr in from_enrollments.items():
            student = student_map.get(student_id)
            if student is None or student.is_active != "yes":
                continue
            totals = from_totals.get(
                from_enr.id,
                {"total_due": 0.0, "total_paid": 0.0, "total_balance": 0.0},
            )
            balance = float(totals.get("total_balance") or 0)
            if balance <= 0:
                continue
            to_enr = to_enrollments.get(student_id)
            rows.append(
                {
                    "student_id": student_id,
                    "admission_no": student.admission_no,
                    "roll_no": student.roll_no,
                    "full_name": student_selectors.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "from_student_session_id": from_enr.id,
                    "to_student_session_id": to_enr.id if to_enr else None,
                    "previous_balance": balance,
                    "has_target_enrollment": to_enr is not None,
                    "already_carried": bool(to_enr and to_enr.id in existing_cf),
                }
            )

        rows.sort(
            key=lambda r: (
                (
                    int(r["roll_no"])
                    if r["roll_no"] is not None and str(r["roll_no"]).isdigit()
                    else 9999
                ),
                r["full_name"].lower(),
            )
        )

        return {
            "from_session_id": from_session_id,
            "from_session_name": from_session.session,
            "to_session_id": to_session_id,
            "to_session_name": to_session.session,
            "class_id": class_id,
            "class_name": school_class.class_field,
            "section_id": section_id,
            "section_name": section.section,
            "students": rows,
        }

    def carry_forward(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            from_session_id = int(payload.get("from_session_id") or 0)
            to_session_id = int(payload.get("to_session_id") or 0)
            class_id = int(payload.get("class_id") or 0)
            section_id = int(payload.get("section_id") or 0)
            fee_session_group_id = int(payload.get("fee_session_group_id") or 0)
        except (TypeError, ValueError) as exc:
            raise FeeValidationError("Invalid carry-forward filters.") from exc

        student_ids = payload.get("student_ids") or []
        if not isinstance(student_ids, list) or not student_ids:
            raise FeeValidationError("Select at least one student.")
        if not fee_session_group_id:
            raise FeeValidationError("fee_session_group_id is required.")

        fsg = FeeSessionGroups.objects.filter(id=fee_session_group_id).first()
        if fsg is None:
            raise FeeNotFoundError("Target fee assignment not found.")
        if fsg.session_id != to_session_id:
            raise FeeValidationError(
                "Fee assignment must belong to the target session."
            )

        preview = self.preview(
            from_session_id=from_session_id,
            to_session_id=to_session_id,
            class_id=class_id,
            section_id=section_id,
        )
        preview_map = {row["student_id"]: row for row in preview["students"]}
        selected = {int(x) for x in student_ids}
        now = timezone.now()
        carried = 0

        with transaction.atomic():
            for student_id in selected:
                row = preview_map.get(student_id)
                if row is None or not row["has_target_enrollment"]:
                    continue
                to_ssid = row["to_student_session_id"]
                balance = float(row["previous_balance"] or 0)
                if balance <= 0 or to_ssid is None:
                    continue
                existing = StudentFeesMaster.objects.filter(
                    student_session_id=to_ssid,
                    fee_session_group_id=fee_session_group_id,
                ).first()
                if existing is None:
                    StudentFeesMaster.objects.create(
                        is_system=1,
                        student_session_id=to_ssid,
                        fee_session_group_id=fee_session_group_id,
                        amount=balance,
                        is_active="yes",
                        created_at=now,
                    )
                else:
                    existing.is_system = 1
                    existing.amount = balance
                    existing.is_active = "yes"
                    existing.save(update_fields=["is_system", "amount", "is_active"])
                carried += 1

        logger.info(
            "Carried forward fees from=%s to=%s count=%s",
            from_session_id,
            to_session_id,
            carried,
        )
        result = self.preview(
            from_session_id=from_session_id,
            to_session_id=to_session_id,
            class_id=class_id,
            section_id=section_id,
        )
        result["carried_count"] = carried
        return result

    @staticmethod
    def _validate_ids(
        from_session_id: int, to_session_id: int, class_id: int, section_id: int
    ) -> None:
        if not all([from_session_id, to_session_id, class_id, section_id]):
            raise FeeValidationError(
                "from_session_id, to_session_id, class_id, and section_id are required."
            )
