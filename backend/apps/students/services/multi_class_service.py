"""Multi-class student enrollments within the same academic session."""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections
from apps.academics.selectors.session_selectors import get_current_session
from apps.students.domain.student_exceptions import StudentNotFoundError, StudentValidationError
from apps.students.models.student_session import StudentSession
from apps.students.selectors import student_selectors as student_sel
from apps.students.selectors.promotion_selectors import students_by_ids

logger = logging.getLogger(__name__)


class MultiClassService:
    def get_roster(
        self, *, class_id: int | None = None, section_id: int | None = None
    ) -> dict[str, Any]:
        session = get_current_session()
        if session is None:
            raise StudentValidationError("No active academic session found.")

        primary_qs = StudentSession.objects.filter(
            session_id=session.id, default_login=1, is_active="yes"
        )
        if class_id:
            primary_qs = primary_qs.filter(class_id=class_id)
        if section_id:
            primary_qs = primary_qs.filter(section_id=section_id)
        primary_enrollments = list(primary_qs)

        student_ids = [e.student_id for e in primary_enrollments if e.student_id]
        students = students_by_ids(student_ids)

        all_enrollments = StudentSession.objects.filter(
            session_id=session.id, student_id__in=student_ids
        )
        by_student: dict[int, list[StudentSession]] = {}
        for row in all_enrollments:
            by_student.setdefault(row.student_id, []).append(row)

        class_map = {
            c.id: c.class_field
            for c in Classes.objects.filter(
                id__in={e.class_id for rows in by_student.values() for e in rows if e.class_id}
            )
        }
        section_map = {
            s.id: s.section
            for s in Sections.objects.filter(
                id__in={
                    e.section_id for rows in by_student.values() for e in rows if e.section_id
                }
            )
        }

        rows = []
        for enrollment in primary_enrollments:
            student = students.get(enrollment.student_id)
            if student is None or student.is_active != "yes":
                continue
            enrollments = by_student.get(enrollment.student_id, [])
            rows.append(
                {
                    "student_id": student.id,
                    "admission_no": student.admission_no,
                    "student_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "primary_class_id": enrollment.class_id,
                    "primary_class_name": class_map.get(enrollment.class_id, ""),
                    "primary_section_id": enrollment.section_id,
                    "primary_section_name": section_map.get(enrollment.section_id, ""),
                    "enrollments": [
                        {
                            "student_session_id": e.id,
                            "class_id": e.class_id,
                            "class_name": class_map.get(e.class_id, ""),
                            "section_id": e.section_id,
                            "section_name": section_map.get(e.section_id, ""),
                            "is_primary": int(e.default_login or 0) == 1,
                        }
                        for e in enrollments
                    ],
                }
            )

        rows.sort(key=lambda r: r["student_name"].lower())
        return {"session_id": session.id, "students": rows}

    def save_enrollments(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            student_id = int(payload.get("student_id"))
        except (TypeError, ValueError) as exc:
            raise StudentValidationError("student_id is required.") from exc

        extra = payload.get("enrollments") or []
        if not isinstance(extra, list):
            raise StudentValidationError("enrollments must be a list.")

        session = get_current_session()
        if session is None:
            raise StudentValidationError("No active academic session found.")
        if student_id not in students_by_ids([student_id]):
            raise StudentNotFoundError()

        primary = StudentSession.objects.filter(
            student_id=student_id, session_id=session.id, default_login=1
        ).first()
        if primary is None:
            raise StudentValidationError(
                "Student has no primary enrollment in the active session."
            )

        desired = {
            (int(item.get("class_id")), int(item.get("section_id")))
            for item in extra
            if item.get("class_id") and item.get("section_id")
        }
        desired.add((primary.class_id, primary.section_id))
        now = timezone.now()

        with transaction.atomic():
            existing = list(
                StudentSession.objects.filter(
                    student_id=student_id, session_id=session.id
                )
            )
            existing_keys = {(e.class_id, e.section_id) for e in existing}

            for class_id, section_id in desired - existing_keys:
                StudentSession.objects.create(
                    session_id=session.id,
                    student_id=student_id,
                    class_id=class_id,
                    section_id=section_id,
                    default_login=0,
                    is_active="yes",
                    is_alumni=0,
                    created_at=now,
                    updated_at=now.date(),
                )

            for row in existing:
                key = (row.class_id, row.section_id)
                if key not in desired and int(row.default_login or 0) != 1:
                    row.delete()

        logger.info("Saved multi-class enrollments student=%s count=%s", student_id, len(desired))
        return self.get_roster()
