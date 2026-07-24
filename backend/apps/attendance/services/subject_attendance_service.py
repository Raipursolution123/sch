from __future__ import annotations

import datetime
import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections, SubjectTimetable
from apps.academics.selectors.session_selectors import get_current_session
from apps.academics.selectors.timetable_selectors import period_to_dict
from apps.attendance.domain.attendance_exceptions import (
    AttendanceNotFoundError,
    AttendanceValidationError,
)
from apps.attendance.models import AttendenceType
from apps.attendance.selectors.attendance_selectors import ATTENDANCE_TYPE_KEY_MAP
from apps.students.models import Students, StudentSession, StudentSubjectAttendances

logger = logging.getLogger(__name__)


class SubjectAttendanceService:
    """Period-level student attendance against `subject_timetable` rows."""

    def list_periods(
        self, *, class_id: int, section_id: int, date_str: str
    ) -> list[dict[str, Any]]:
        if not class_id or not section_id or not date_str:
            raise AttendanceValidationError(
                "class_id, section_id, and date are required."
            )
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise AttendanceValidationError(
                "Invalid date format. Use YYYY-MM-DD."
            ) from exc

        day_name = target_date.strftime("%A")
        current_session = get_current_session()
        qs = SubjectTimetable.objects.filter(
            class_id=class_id, section_id=section_id, day__iexact=day_name
        )
        if current_session:
            qs = qs.filter(session_id=current_session.id)
        qs = qs.order_by("start_time", "id")
        return [period_to_dict(row) for row in qs]

    def get_roster(self, *, subject_timetable_id: int, date_str: str) -> dict[str, Any]:
        if not subject_timetable_id or not date_str:
            raise AttendanceValidationError(
                "subject_timetable_id and date are required."
            )
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise AttendanceValidationError(
                "Invalid date format. Use YYYY-MM-DD."
            ) from exc

        period = SubjectTimetable.objects.filter(id=subject_timetable_id).first()
        if period is None:
            raise AttendanceNotFoundError("Timetable period not found.")

        school_class = Classes.objects.filter(id=period.class_id).first()
        section = Sections.objects.filter(id=period.section_id).first()
        period_info = period_to_dict(period)

        current_session = get_current_session()
        sessions_qs = StudentSession.objects.filter(
            class_id=period.class_id, section_id=period.section_id
        )
        if current_session:
            sessions_qs = sessions_qs.filter(session_id=current_session.id)
        sessions = list(sessions_qs)
        session_map = {s.student_id: s for s in sessions}
        student_ids = list(session_map.keys())

        types = list(AttendenceType.objects.filter(is_active="yes"))
        if not types:
            types = list(AttendenceType.objects.all())
        type_map = {t.id: t for t in types}
        default_type_id = types[0].id if types else None
        if default_type_id is None:
            raise AttendanceValidationError("No attendance types are configured.")

        existing = {
            row.student_session_id: row
            for row in StudentSubjectAttendances.objects.filter(
                subject_timetable_id=subject_timetable_id, date=target_date
            )
        }

        students = (
            Students.objects.filter(id__in=student_ids, is_active="yes").order_by(
                "roll_no", "firstname", "lastname"
            )
            if student_ids
            else []
        )

        entries = []
        for student in students:
            sess = session_map.get(student.id)
            if sess is None:
                continue
            record = existing.get(sess.id)
            type_id = (
                record.attendence_type_id if record is not None else default_type_id
            )
            att_type = type_map.get(type_id)
            status_label = att_type.type if att_type else "Present"
            status_key = ATTENDANCE_TYPE_KEY_MAP.get(
                status_label,
                (
                    att_type.key_value.lower()
                    if att_type and att_type.key_value
                    else "present"
                ),
            )
            entries.append(
                {
                    "student_id": student.id,
                    "student_session_id": sess.id,
                    "admission_no": student.admission_no,
                    "full_name": f"{student.firstname or ''} {student.lastname or ''}".strip(),
                    "roll_no": student.roll_no,
                    "attendence_type_id": type_id,
                    "status_key": status_key,
                    "status_label": status_label,
                    "remark": (record.remark if record else "") or "",
                    "attendance_id": record.id if record else None,
                }
            )

        entries.sort(
            key=lambda x: (
                int(x["roll_no"])
                if x["roll_no"] and str(x["roll_no"]).isdigit()
                else 9999
            )
        )

        return {
            "subject_timetable_id": subject_timetable_id,
            "date": date_str,
            "class_id": period.class_id,
            "class_name": school_class.class_field if school_class else "",
            "section_id": period.section_id,
            "section_name": section.section if section else "",
            "period": period_info,
            "entries": entries,
        }

    def mark(self, payload: dict[str, Any]) -> dict[str, Any]:
        try:
            subject_timetable_id = int(payload.get("subject_timetable_id") or 0)
        except (TypeError, ValueError) as exc:
            raise AttendanceValidationError(
                "subject_timetable_id is required."
            ) from exc
        date_str = str(payload.get("date") or "").strip()
        entries = payload.get("entries") or []
        if not subject_timetable_id or not date_str:
            raise AttendanceValidationError(
                "subject_timetable_id and date are required."
            )
        if not isinstance(entries, list) or not entries:
            raise AttendanceValidationError("entries are required.")

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise AttendanceValidationError(
                "Invalid date format. Use YYYY-MM-DD."
            ) from exc

        period = SubjectTimetable.objects.filter(id=subject_timetable_id).first()
        if period is None:
            raise AttendanceNotFoundError("Timetable period not found.")

        type_ids = set(
            AttendenceType.objects.filter(is_active="yes").values_list("id", flat=True)
        )
        if not type_ids:
            type_ids = set(AttendenceType.objects.values_list("id", flat=True))
        if not type_ids:
            raise AttendanceValidationError("No attendance types are configured.")

        current_session = get_current_session()
        sessions_qs = StudentSession.objects.filter(
            class_id=period.class_id, section_id=period.section_id
        )
        if current_session:
            sessions_qs = sessions_qs.filter(session_id=current_session.id)
        session_map = {s.student_id: s for s in sessions_qs}
        now = timezone.now()

        with transaction.atomic():
            for raw in entries:
                try:
                    student_id = int(raw.get("student_id") or 0)
                    type_id = int(raw.get("attendence_type_id") or 0)
                except (TypeError, ValueError):
                    continue
                if not student_id or type_id not in type_ids:
                    continue
                sess = session_map.get(student_id)
                if sess is None:
                    continue
                remark = str(raw.get("remark") or "").strip()
                row = StudentSubjectAttendances.objects.filter(
                    student_session_id=sess.id,
                    subject_timetable_id=subject_timetable_id,
                    date=target_date,
                ).first()
                if row is None:
                    StudentSubjectAttendances.objects.create(
                        student_session_id=sess.id,
                        subject_timetable_id=subject_timetable_id,
                        attendence_type_id=type_id,
                        date=target_date,
                        remark=remark or None,
                        created_at=now,
                    )
                else:
                    row.attendence_type_id = type_id
                    row.remark = remark or None
                    row.created_at = now
                    row.save(
                        update_fields=["attendence_type_id", "remark", "created_at"]
                    )

        logger.info(
            "Marked subject attendance period=%s date=%s count=%s",
            subject_timetable_id,
            date_str,
            len(entries),
        )
        return self.get_roster(
            subject_timetable_id=subject_timetable_id, date_str=date_str
        )
