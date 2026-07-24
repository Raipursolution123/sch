import datetime
import logging

from django.db import transaction
from django.utils import timezone

from apps.academics.models import Classes, Sections
from apps.academics.selectors.session_selectors import get_current_session
from apps.attendance.domain.attendance_exceptions import (
    AttendanceNotFoundError,
    AttendanceValidationError,
)
from apps.attendance.models import AttendenceType
from apps.attendance.selectors.attendance_selectors import ATTENDANCE_TYPE_KEY_MAP
from apps.students.models import StudentAttendences, Students, StudentSession

logger = logging.getLogger(__name__)


class AttendanceService:
    def list_types(self):
        types = AttendenceType.objects.filter(is_active="yes")
        results = []
        for t in types:
            results.append(
                {
                    "id": t.id,
                    "key": ATTENDANCE_TYPE_KEY_MAP.get(
                        t.type,
                        t.key_value.lower() if t.key_value else t.type.lower(),
                    ),
                    "label": t.type,
                    "is_active": t.is_active,
                }
            )
        return results

    def get_roster(self, class_id, section_id, date_str):
        if not all([class_id, section_id, date_str]):
            raise AttendanceValidationError(
                "class_id, section_id, and date are required."
            )

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise AttendanceValidationError("Invalid date format. Use YYYY-MM-DD.")

        try:
            school_class = Classes.objects.get(pk=class_id)
            section = Sections.objects.get(pk=section_id)
        except (Classes.DoesNotExist, Sections.DoesNotExist):
            raise AttendanceNotFoundError("Class or section not found.")

        current_session = get_current_session()
        if current_session:
            sessions = StudentSession.objects.filter(
                class_id=class_id,
                section_id=section_id,
                session_id=current_session.id,
            )
        else:
            sessions = StudentSession.objects.filter(
                class_id=class_id, section_id=section_id
            )

        session_map = {s.student_id: s for s in sessions}
        student_ids = list(session_map.keys())
        if not student_ids:
            return {
                "class_id": int(class_id),
                "class_name": school_class.class_field,
                "section_id": int(section_id),
                "section_name": section.section,
                "date": date_str,
                "entries": [],
            }

        students = Students.objects.filter(
            id__in=student_ids, is_active="yes"
        ).order_by("roll_no", "firstname", "lastname")

        session_ids = [s.id for s in sessions]
        attendances = StudentAttendences.objects.filter(
            student_session_id__in=session_ids, date=target_date
        )
        attendance_map = {a.student_session_id: a for a in attendances}

        types = AttendenceType.objects.filter(is_active="yes")
        type_map = {t.id: t for t in types}

        entries = []
        for student in students:
            sess = session_map.get(student.id)
            if not sess:
                continue

            record = attendance_map.get(sess.id)
            type_id = record.attendence_type_id if record else 1
            att_type = type_map.get(type_id)

            status_label = att_type.type if att_type else "Present"
            status_key = ATTENDANCE_TYPE_KEY_MAP.get(status_label, "present")

            entries.append(
                {
                    "student_id": student.id,
                    "admission_no": student.admission_no,
                    "full_name": f"{student.firstname or ''} {student.lastname or ''}".strip(),
                    "roll_no": student.roll_no,
                    "attendence_type_id": type_id,
                    "status_key": status_key,
                    "status_label": status_label,
                    "remark": record.remark if record else "",
                }
            )

        entries.sort(
            key=lambda x: (
                int(x["roll_no"])
                if x["roll_no"] and str(x["roll_no"]).isdigit()
                else 999
            )
        )

        return {
            "class_id": int(class_id),
            "class_name": school_class.class_field,
            "section_id": int(section_id),
            "section_name": section.section,
            "date": date_str,
            "entries": entries,
        }

    def mark_attendance(self, payload):
        class_id = payload.get("class_id")
        section_id = payload.get("section_id")
        date_str = payload.get("date")
        entries = payload.get("entries", [])

        if not all([class_id, section_id, date_str]):
            raise AttendanceValidationError(
                "class_id, section_id, and date are required."
            )

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise AttendanceValidationError("Invalid date format. Use YYYY-MM-DD.")

        current_session = get_current_session()
        if current_session:
            sessions = StudentSession.objects.filter(
                class_id=class_id,
                section_id=section_id,
                session_id=current_session.id,
            )
        else:
            sessions = StudentSession.objects.filter(
                class_id=class_id, section_id=section_id
            )

        session_map = {s.student_id: s for s in sessions}

        try:
            with transaction.atomic():
                for entry in entries:
                    student_id = entry.get("student_id")
                    type_id = entry.get("attendence_type_id")
                    remark = entry.get("remark", "")

                    sess = session_map.get(student_id)
                    if not sess:
                        continue

                    record, created = StudentAttendences.objects.get_or_create(
                        student_session_id=sess.id,
                        date=target_date,
                        defaults={
                            "attendence_type_id": type_id,
                            "remark": remark,
                            "created_at": timezone.now(),
                            "is_active": "no",
                        },
                    )
                    if not created:
                        record.attendence_type_id = type_id
                        record.remark = remark
                        record.updated_at = timezone.now()
                        record.save()
        except Exception as e:
            logger.error(f"Error marking attendance: {str(e)}")
            raise

    def get_report(self, filters):
        class_id = filters.get("class_id")
        section_id = filters.get("section_id")
        from_date_str = filters.get("from_date")
        to_date_str = filters.get("to_date")

        if not all([from_date_str, to_date_str]):
            raise AttendanceValidationError("from_date and to_date are required.")

        try:
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        except ValueError:
            raise AttendanceValidationError("Invalid date format. Use YYYY-MM-DD.")

        qs = StudentAttendences.objects.filter(date__gte=from_date, date__lte=to_date)

        current_session = get_current_session()

        if class_id or section_id or current_session:
            sessions_filter = {}
            if class_id:
                sessions_filter["class_id"] = class_id
            if section_id:
                sessions_filter["section_id"] = section_id
            if current_session:
                sessions_filter["session_id"] = current_session.id

            sessions = StudentSession.objects.filter(**sessions_filter)
            qs = qs.filter(student_session_id__in=[s.id for s in sessions])

        records = list(qs)

        session_ids = [r.student_session_id for r in records if r.student_session_id]
        sessions = StudentSession.objects.filter(id__in=session_ids)
        session_map = {s.id: s for s in sessions}

        student_ids = [s.student_id for s in sessions if s.student_id]
        class_ids = [s.class_id for s in sessions if s.class_id]
        section_ids = [s.section_id for s in sessions if s.section_id]

        students = Students.objects.filter(id__in=student_ids)
        classes = Classes.objects.filter(id__in=class_ids)
        sections = Sections.objects.filter(id__in=section_ids)

        student_map = {s.id: s for s in students}
        class_map = {c.id: c.class_field for c in classes}
        section_map = {s.id: s.section for s in sections}

        types = AttendenceType.objects.all()
        type_map = {t.id: t for t in types}

        rows = []
        summary = {
            "present": 0,
            "absent": 0,
            "late": 0,
            "half_day": 0,
            "holiday": 0,
        }

        for r in records:
            sess = session_map.get(r.student_session_id)
            if not sess:
                continue

            student = student_map.get(sess.student_id)
            if not student:
                continue

            type_id = r.attendence_type_id
            att_type = type_map.get(type_id)
            status_label = att_type.type if att_type else "Present"
            status_key = ATTENDANCE_TYPE_KEY_MAP.get(status_label, "present")

            if status_key in summary:
                summary[status_key] += 1
            else:
                summary["present"] += 1

            rows.append(
                {
                    "id": r.id,
                    "student_id": student.id,
                    "student_name": f"{student.firstname or ''} {student.lastname or ''}".strip(),
                    "roll_no": student.roll_no,
                    "class_name": class_map.get(sess.class_id, "—"),
                    "section_name": section_map.get(sess.section_id, "—"),
                    "date": r.date.strftime("%Y-%m-%d") if r.date else "",
                    "status_key": status_key,
                    "status_label": status_label,
                    "remark": (
                        r.remark.replace("Leave Approved", "").strip()
                        if r.remark
                        else ""
                    ),
                }
            )

        rows.sort(key=lambda x: x["date"], reverse=True)

        return {
            "total_records": len(rows),
            **summary,
            "rows": rows,
        }
