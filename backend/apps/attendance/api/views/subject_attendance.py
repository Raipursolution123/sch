import datetime
import logging
from django.db import transaction, connection
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.academics.models import Classes, Sections, Sessions
from apps.attendance.domain.attendance_exceptions import AttendanceError
from apps.attendance.api.views.common import MODULE, attendance_error_response
from apps.attendance.models import AttendenceType
from apps.attendance.selectors.attendance_selectors import ATTENDANCE_TYPE_KEY_MAP
from apps.students.models import Students, StudentSession, StudentSubjectAttendances
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)
CATEGORY = "student_attendance"

def get_or_create_subject_timetable(class_id, section_id, subject_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id FROM subject_timetable 
        WHERE class_id = %s AND section_id = %s 
        AND subject_group_subject_id IN (
            SELECT id FROM subject_group_subjects WHERE subject_id = %s
        )
        LIMIT 1
    """, [class_id, section_id, subject_id])
    row = cursor.fetchone()
    if row:
        return row[0]
        
    # Not found, let's create a default timetable record so we can link it
    cursor.execute("SELECT id, subject_group_id FROM subject_group_subjects WHERE subject_id = %s LIMIT 1", [subject_id])
    sgs_row = cursor.fetchone()
    sgs_id = sgs_row[0] if sgs_row else None
    sg_id = sgs_row[1] if sgs_row else None
    
    active_session = Sessions.objects.filter(is_active="yes").first()
    session_id = active_session.id if active_session else 1
    
    if sgs_id:
        cursor.execute("""
            INSERT INTO subject_timetable (session_id, class_id, section_id, subject_group_id, subject_group_subject_id, day)
            VALUES (%s, %s, %s, %s, %s, 'Monday')
        """, [session_id, class_id, section_id, sg_id, sgs_id])
        return cursor.lastrowid
    return None

class SubjectAttendanceRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        subject_id = request.query_params.get("subject_id")
        date_str = request.query_params.get("date")

        if not all([class_id, section_id, subject_id, date_str]):
            return APIResponse.error(message="class_id, section_id, subject_id, and date are required.")

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return APIResponse.error(message="Invalid date format. Use YYYY-MM-DD.")

        today = timezone.now().date()
        if target_date > today:
            return APIResponse.error(message="Attendance cannot be marked or viewed for future dates.")

        timetable_id = get_or_create_subject_timetable(class_id, section_id, subject_id)
        if not timetable_id:
            return APIResponse.error(message="Subject is not assigned to this class section.")

        current_session = Sessions.objects.filter(is_active="yes").first()
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
        students = Students.objects.filter(id__in=session_map.keys(), is_active="yes")

        session_ids = [s.id for s in sessions]
        attendances = StudentSubjectAttendances.objects.filter(
            student_session_id__in=session_ids, date=target_date, subject_timetable_id=timetable_id
        )
        attendance_map = {a.student_session_id: a for a in attendances}

        types = AttendenceType.objects.all()
        type_map = {t.id: t for t in types}
        absent_type = next((t for t in types if (t.key_value and t.key_value.lower() == 'absent') or t.type.lower() == 'absent'), None)

        entries = []
        for student in students:
            sess = session_map.get(student.id)
            if not sess:
                continue

            record = attendance_map.get(sess.id)
            if record:
                type_id = record.attendence_type_id
            else:
                if student.admission_date and student.admission_date > target_date:
                    type_id = absent_type.id if absent_type else 2
                else:
                    type_id = 1

            att_type = type_map.get(type_id)

            status_label = att_type.type if att_type else ("Absent" if (student.admission_date and student.admission_date > target_date) else "Present")
            status_key = ATTENDANCE_TYPE_KEY_MAP.get(status_label, att_type.key_value.lower() if att_type and att_type.key_value else status_label.lower())

            entries.append(
                {
                    "student_id": student.id,
                    "admission_no": student.admission_no,
                    "full_name": f"{student.firstname or ''} {student.lastname or ''}".strip(),
                    "roll_no": student.roll_no,
                    "attendence_type_id": type_id,
                    "status_key": status_key,
                    "status_label": status_label,
                    "remark": record.remark if record else ("Not admitted on this date" if (not record and student.admission_date and student.admission_date > target_date) else ""),
                }
            )

        entries.sort(
            key=lambda x: (
                int(x["roll_no"])
                if x["roll_no"] and str(x["roll_no"]).isdigit()
                else 999
            )
        )

        return APIResponse.success(
            data={
                "class_id": int(class_id),
                "section_id": int(section_id),
                "subject_id": int(subject_id),
                "date": date_str,
                "entries": entries,
            },
            message="Subject roster retrieved successfully."
        )


class SubjectAttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request):
        payload = request.data
        class_id = payload.get("class_id")
        section_id = payload.get("section_id")
        subject_id = payload.get("subject_id")
        date_str = payload.get("date")
        entries = payload.get("entries", [])

        if not all([class_id, section_id, subject_id, date_str]):
            return APIResponse.error(message="class_id, section_id, subject_id, and date are required.")

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return APIResponse.error(message="Invalid date format. Use YYYY-MM-DD.")

        today = timezone.now().date()
        if target_date > today:
            return APIResponse.error(message="Attendance cannot be marked for future dates.")

        timetable_id = get_or_create_subject_timetable(class_id, section_id, subject_id)
        if not timetable_id:
            return APIResponse.error(message="Subject is not assigned to this class section.")

        current_session = Sessions.objects.filter(is_active="yes").first()
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

                    record, created = StudentSubjectAttendances.objects.get_or_create(
                        student_session_id=sess.id,
                        date=target_date,
                        subject_timetable_id=timetable_id,
                        defaults={
                            "attendence_type_id": type_id,
                            "remark": remark,
                            "created_at": timezone.now(),
                        },
                    )
                    if not created:
                        record.attendence_type_id = type_id
                        record.remark = remark
                        record.save()
            return APIResponse.success(message="Subject attendance marked successfully.")
        except Exception as e:
            logger.error(f"Error marking subject attendance: {str(e)}")
            return APIResponse.error(message=f"Error marking subject attendance: {str(e)}")


class SubjectAttendanceReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "attendance_report"

    def get(self, request):
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        subject_id = request.query_params.get("subject_id")
        from_date_str = request.query_params.get("from_date")
        to_date_str = request.query_params.get("to_date")

        if not all([from_date_str, to_date_str]):
            return APIResponse.error(message="from_date and to_date are required.")

        try:
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        except ValueError:
            return APIResponse.error(message="Invalid date format. Use YYYY-MM-DD.")

        qs = StudentSubjectAttendances.objects.filter(date__gte=from_date, date__lte=to_date)

        if class_id or section_id:
            sessions_filter = {}
            if class_id:
                sessions_filter["class_id"] = class_id
            if section_id:
                sessions_filter["section_id"] = section_id
            current_session = Sessions.objects.filter(is_active="yes").first()
            if current_session:
                sessions_filter["session_id"] = current_session.id
                
            sessions = StudentSession.objects.filter(**sessions_filter)
            qs = qs.filter(student_session_id__in=[s.id for s in sessions])

        if subject_id:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id FROM subject_timetable 
                WHERE subject_group_subject_id IN (
                    SELECT id FROM subject_group_subjects WHERE subject_id = %s
                )
            """, [subject_id])
            timetable_ids = [row[0] for row in cursor.fetchall()]
            qs = qs.filter(subject_timetable_id__in=timetable_ids)

        records = list(qs)

        session_ids = [r.student_session_id for r in records if r.student_session_id]
        sessions = StudentSession.objects.filter(id__in=session_ids)
        session_map = {s.id: s for s in sessions}

        student_ids = [s.student_id for s in sessions if s.student_id]
        students = Students.objects.filter(id__in=student_ids)
        student_map = {s.id: s for s in students}

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
                    "date": r.date.strftime("%Y-%m-%d") if r.date else "",
                    "status_key": status_key,
                    "status_label": status_label,
                    "remark": r.remark or "",
                }
            )

        rows.sort(key=lambda x: x["date"], reverse=True)

        return APIResponse.success(
            data={
                "total_records": len(rows),
                **summary,
                "rows": rows,
            },
            message="Subject attendance report retrieved successfully."
        )
