"""Positive (addon) fee adjustments — legacy `cyc_student_addon_fee` + `student_fees_master`."""

from __future__ import annotations

import logging
from datetime import date
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.selectors.session_selectors import get_current_session
from apps.cyc_extensions.models.cyc_student_addon_fee import CycStudentAddonFee
from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.models.fee_groups import FeeGroups
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.fees.models.feetype import Feetype
from apps.students.models.student_fees_master import StudentFeesMaster
from apps.students.models.student_session import StudentSession
from apps.students.selectors import student_selectors as student_sel
from apps.students.selectors.promotion_selectors import students_by_ids

logger = logging.getLogger(__name__)

ADDON_GROUP_NAME = "Addon Fee"
ADDON_FEETYPE_NAME = "Other Addon Fee"


class PositiveFeeAdjustmentService:
    def apply_bulk(self, payload: dict[str, Any], *, entry_by: int) -> dict[str, Any]:
        rows = payload.get("adjustments") or []
        if not isinstance(rows, list) or not rows:
            raise FeeValidationError("adjustments list is required.")

        session = get_current_session()
        if session is None:
            raise FeeValidationError("No active academic session found.")

        fsg_id = self._ensure_addon_fee_session_group(session.id)
        today = date.today()
        now = timezone.now()
        applied = 0

        with transaction.atomic():
            for item in rows:
                try:
                    student_id = int(item.get("student_id"))
                    amount = float(item.get("amount") or 0)
                except (TypeError, ValueError) as exc:
                    raise FeeValidationError(
                        "Each adjustment requires student_id and amount."
                    ) from exc
                if amount <= 0:
                    continue
                remark = str(item.get("remark") or "").strip()

                enrollment = StudentSession.objects.filter(
                    student_id=student_id, session_id=session.id
                ).first()
                if enrollment is None:
                    raise FeeValidationError(
                        f"Student {student_id} is not enrolled in the active session."
                    )

                # Legacy stores student_session.id in cyc_student_addon_fee.student_id
                CycStudentAddonFee.objects.create(
                    student_id=enrollment.id,
                    amount=amount,
                    remark=remark,
                    date=today,
                    entry_by=entry_by or 0,
                )
                StudentFeesMaster.objects.create(
                    is_system=1,
                    student_session_id=enrollment.id,
                    fee_session_group_id=fsg_id,
                    amount=amount,
                    is_active="yes",
                    created_at=now,
                )
                applied += 1

        logger.info(
            "Applied %s positive fee adjustments session=%s", applied, session.id
        )
        return {"applied_count": applied, "session_id": session.id}

    def get_roster(
        self, *, class_id: int | None = None, section_id: int | None = None
    ) -> dict[str, Any]:
        from apps.academics.models import Classes, Sections

        session = get_current_session()
        if session is None:
            raise FeeValidationError("No active academic session found.")

        enrollments = StudentSession.objects.filter(
            session_id=session.id, is_active="yes"
        )
        if class_id:
            enrollments = enrollments.filter(class_id=class_id)
        if section_id:
            enrollments = enrollments.filter(section_id=section_id)
        enrollments = list(enrollments)

        student_ids = [e.student_id for e in enrollments if e.student_id]
        students = students_by_ids(student_ids)
        class_map = {
            c.id: c.class_field
            for c in Classes.objects.filter(
                id__in={e.class_id for e in enrollments if e.class_id}
            )
        }
        section_map = {
            s.id: s.section
            for s in Sections.objects.filter(
                id__in={e.section_id for e in enrollments if e.section_id}
            )
        }

        rows = []
        for enrollment in enrollments:
            student = students.get(enrollment.student_id)
            if student is None or student.is_active != "yes":
                continue
            rows.append(
                {
                    "student_id": student.id,
                    "student_session_id": enrollment.id,
                    "admission_no": student.admission_no,
                    "student_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "class_id": enrollment.class_id,
                    "class_name": class_map.get(enrollment.class_id, ""),
                    "section_id": enrollment.section_id,
                    "section_name": section_map.get(enrollment.section_id, ""),
                }
            )

        rows.sort(
            key=lambda r: (
                r["class_name"],
                r["section_name"],
                r["student_name"].lower(),
            )
        )
        return {"session_id": session.id, "students": rows}

    def list_recent(self, *, limit: int = 200) -> list[dict[str, Any]]:
        session = get_current_session()
        qs = CycStudentAddonFee.objects.all().order_by("-af_id")
        if session:
            session_ids = list(
                StudentSession.objects.filter(session_id=session.id).values_list(
                    "id", flat=True
                )
            )
            qs = qs.filter(student_id__in=session_ids)
        rows = list(qs[:limit])
        enrollments = {
            e.id: e
            for e in StudentSession.objects.filter(id__in={r.student_id for r in rows})
        }
        student_ids = {e.student_id for e in enrollments.values()}
        students = students_by_ids(list(student_ids))
        return [
            {
                "id": row.af_id,
                "student_session_id": row.student_id,
                "student_id": (
                    enrollments[row.student_id].student_id
                    if row.student_id in enrollments
                    else None
                ),
                "student_name": (
                    student_sel.format_student_name(
                        students[enrollments[row.student_id].student_id].firstname,
                        students[enrollments[row.student_id].student_id].middlename,
                        students[enrollments[row.student_id].student_id].lastname,
                    )
                    if row.student_id in enrollments
                    and enrollments[row.student_id].student_id in students
                    else str(row.student_id)
                ),
                "amount": row.amount,
                "remark": row.remark or "",
                "date": row.date.isoformat() if row.date else None,
                "entry_by": row.entry_by,
            }
            for row in rows
        ]

    def _ensure_addon_fee_session_group(self, session_id: int) -> int:
        group = FeeGroups.objects.filter(name=ADDON_GROUP_NAME).first()
        if group is None:
            now = timezone.now()
            group = FeeGroups.objects.create(
                name=ADDON_GROUP_NAME,
                is_system=1,
                description="System addon / positive fee adjustments",
                is_active="yes",
                created_at=now,
            )

        feetype = Feetype.objects.filter(type=ADDON_FEETYPE_NAME).first()
        if feetype is None:
            now = timezone.now()
            feetype = Feetype.objects.create(
                is_system=1,
                type=ADDON_FEETYPE_NAME,
                code="ADDON",
                is_active="yes",
                created_at=now,
                updated_at=now.date(),
            )

        fsg = FeeSessionGroups.objects.filter(
            fee_groups_id=group.id, session_id=session_id
        ).first()
        if fsg is None:
            fsg = FeeSessionGroups.objects.create(
                fee_groups_id=group.id,
                session_id=session_id,
                is_active="yes",
                created_at=timezone.now(),
            )

        fgft = FeeGroupsFeetype.objects.filter(
            fee_session_group_id=fsg.id, feetype_id=feetype.id
        ).first()
        if fgft is None:
            FeeGroupsFeetype.objects.create(
                fee_session_group_id=fsg.id,
                fee_groups_id=group.id,
                feetype_id=feetype.id,
                session_id=session_id,
                amount=0,
                is_active="yes",
                created_at=timezone.now(),
            )
        return fsg.id
