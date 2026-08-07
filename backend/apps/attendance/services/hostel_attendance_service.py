"""Hostel attendance roster and marking."""

from __future__ import annotations

import datetime
import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.academics.selectors.session_selectors import get_current_session
from apps.attendance.domain.attendance_exceptions import AttendanceValidationError
from apps.attendance.models import AttendenceType
from apps.attendance.selectors.attendance_selectors import ATTENDANCE_TYPE_KEY_MAP
from apps.hostel.models.hostel import Hostel
from apps.hostel.models.hostel_rooms import HostelRooms
from apps.students.models.student_attendences_hostel import StudentAttendencesHostel
from apps.students.models.student_session import StudentSession
from apps.students.selectors import student_selectors as student_sel
from apps.students.selectors.promotion_selectors import students_by_ids

logger = logging.getLogger(__name__)


class HostelAttendanceService:
    def get_roster(self, *, hostel_id: int, date_str: str) -> dict[str, Any]:
        if not hostel_id or not date_str:
            raise AttendanceValidationError("hostel_id and date are required.")
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise AttendanceValidationError("Invalid date format. Use YYYY-MM-DD.") from exc

        if not Hostel.objects.filter(id=hostel_id).exists():
            raise AttendanceValidationError("Hostel not found.")

        session = get_current_session()
        room_ids = list(
            HostelRooms.objects.filter(hostel_id=hostel_id).values_list("id", flat=True)
        )
        if not room_ids:
            return {
                "hostel_id": hostel_id,
                "date": date_str,
                "entries": [],
            }

        enrollments_qs = StudentSession.objects.filter(hostel_room_id__in=room_ids)
        if session:
            enrollments_qs = enrollments_qs.filter(session_id=session.id)
        enrollments = list(enrollments_qs)
        student_ids = [e.student_id for e in enrollments if e.student_id]
        students = students_by_ids(student_ids)

        room_map = {
            r.id: r for r in HostelRooms.objects.filter(id__in=room_ids)
        }
        attendance_rows = StudentAttendencesHostel.objects.filter(
            student_session_id__in=[e.id for e in enrollments],
            date=target_date,
        )
        attendance_map = {a.student_session_id: a for a in attendance_rows}
        types = {t.id: t for t in AttendenceType.objects.filter(is_active="yes")}

        entries = []
        for enrollment in enrollments:
            student = students.get(enrollment.student_id)
            if student is None or student.is_active != "yes":
                continue
            room = room_map.get(enrollment.hostel_room_id)
            record = attendance_map.get(enrollment.id)
            type_id = record.attendence_type_id if record else 1
            att_type = types.get(type_id)
            status_label = att_type.type if att_type else "Present"
            entries.append(
                {
                    "student_id": student.id,
                    "student_session_id": enrollment.id,
                    "admission_no": student.admission_no,
                    "student_name": student_sel.format_student_name(
                        student.firstname, student.middlename, student.lastname
                    ),
                    "hostel_name": Hostel.objects.filter(id=hostel_id)
                    .values_list("hostel_name", flat=True)
                    .first(),
                    "room_no": room.room_no if room else "",
                    "attendence_type_id": type_id,
                    "status_key": ATTENDANCE_TYPE_KEY_MAP.get(
                        status_label, "present"
                    ),
                    "status_label": status_label,
                    "remark": record.remark if record else "",
                }
            )

        entries.sort(key=lambda e: (e["room_no"] or "", e["student_name"].lower()))
        return {"hostel_id": hostel_id, "date": date_str, "entries": entries}

    def mark_attendance(self, payload: dict[str, Any]) -> dict[str, Any]:
        hostel_id = payload.get("hostel_id")
        date_str = payload.get("date")
        entries = payload.get("entries") or []
        if not hostel_id or not date_str:
            raise AttendanceValidationError("hostel_id and date are required.")
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError as exc:
            raise AttendanceValidationError("Invalid date format. Use YYYY-MM-DD.") from exc

        now = timezone.now()
        with transaction.atomic():
            for entry in entries:
                student_session_id = entry.get("student_session_id")
                type_id = entry.get("attendence_type_id", 1)
                remark = entry.get("remark", "")
                if not student_session_id:
                    continue
                record, created = StudentAttendencesHostel.objects.get_or_create(
                    student_session_id=student_session_id,
                    date=target_date,
                    defaults={
                        "attendence_type_id": type_id,
                        "remark": remark or "",
                        "created_at": now,
                        "is_active": "yes",
                    },
                )
                if not created:
                    record.attendence_type_id = type_id
                    record.remark = remark or ""
                    record.updated_at = now
                    record.save()

        logger.info("Marked hostel attendance hostel=%s date=%s count=%s", hostel_id, date_str, len(entries))
        return self.get_roster(hostel_id=int(hostel_id), date_str=date_str)
