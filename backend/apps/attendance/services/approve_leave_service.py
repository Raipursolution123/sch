import datetime
import logging
from datetime import timedelta

import django.db.utils
from django.utils import timezone

from common.pagination.standard import StandardResultsSetPagination

from apps.academics.models import Classes, Sections, Sessions
from apps.attendance.domain.attendance_exceptions import (
    AttendanceNotFoundError,
    AttendanceValidationError,
)
from apps.attendance.models import AttendenceType
from apps.staff.models import Staff
from apps.students.models import (
    StudentApplyleave,
    StudentAttendences,
    StudentSession,
    Students,
)

logger = logging.getLogger(__name__)


class ApproveLeaveService:
    def _get_record(self, pk):
        try:
            if str(pk).startswith("ATT_"):
                real_id = int(pk.replace("ATT_", ""))
                return StudentAttendences.objects.get(pk=real_id), True
            if str(pk).startswith("LV_"):
                real_id = int(pk.replace("LV_", ""))
                return StudentApplyleave.objects.get(pk=real_id), False
            return StudentApplyleave.objects.get(pk=int(pk)), False
        except (
            StudentApplyleave.DoesNotExist,
            StudentAttendences.DoesNotExist,
            ValueError,
        ):
            return None, False

    def list_leave_requests(self, request):
        leaves_qs = list(StudentApplyleave.objects.all().order_by("-id"))

        target_types = AttendenceType.objects.filter(
            type__in=["Absent", "Late", "Holiday"]
        )
        target_type_ids = [t.id for t in target_types]
        exceptions_qs = list(
            StudentAttendences.objects.filter(attendence_type_id__in=target_type_ids)
            .exclude(remark__startswith="[Rejected]")
            .order_by("-id")
        )

        def get_date(item):
            if hasattr(item, "apply_date") and item.apply_date:
                return item.apply_date
            if hasattr(item, "date") and item.date:
                return item.date
            return datetime.date(1970, 1, 1)

        combined = leaves_qs + exceptions_qs
        combined.sort(key=get_date, reverse=True)

        paginator = StandardResultsSetPagination()
        paginated_items = paginator.paginate_queryset(combined, request)

        current_page_items = (
            paginated_items if paginated_items is not None else combined
        )

        student_session_ids = [
            item.student_session_id
            for item in current_page_items
            if item.student_session_id
        ]
        sessions = StudentSession.objects.filter(id__in=student_session_ids)
        session_map = {s.id: s for s in sessions}

        student_ids = [s.student_id for s in sessions if s.student_id]
        class_ids = [s.class_id for s in sessions if s.class_id]
        section_ids = [s.section_id for s in sessions if s.section_id]

        students = Students.objects.filter(id__in=student_ids)
        classes = Classes.objects.filter(id__in=class_ids)
        sections = Sections.objects.filter(id__in=section_ids)

        student_map = {
            s.id: f"{s.firstname or ''} {s.lastname or ''}".strip() for s in students
        }
        class_map = {c.id: c.class_field for c in classes}
        section_map = {s.id: s.section for s in sections}

        results = []
        for item in current_page_items:
            sess = session_map.get(item.student_session_id)
            student_name = "Unknown"
            class_name = "Unknown"
            section_name = "Unknown"

            if sess:
                student_name = student_map.get(sess.student_id, "Unknown")
                class_name = class_map.get(sess.class_id, "Unknown")
                section_name = section_map.get(sess.section_id, "Unknown")

            is_attendance = isinstance(item, StudentAttendences)

            if is_attendance:
                type_label = "Unknown"
                if item.attendence_type_id:
                    att_type = AttendenceType.objects.filter(
                        id=item.attendence_type_id
                    ).first()
                    if att_type:
                        type_label = att_type.type

                results.append(
                    {
                        "id": f"ATT_{item.id}",
                        "student_session_id": item.student_session_id,
                        "student_name": student_name,
                        "class_name": class_name,
                        "section_name": section_name,
                        "from_date": (
                            item.date.strftime("%Y-%m-%d") if item.date else None
                        ),
                        "to_date": (
                            item.date.strftime("%Y-%m-%d") if item.date else None
                        ),
                        "apply_date": (
                            item.date.strftime("%Y-%m-%d") if item.date else None
                        ),
                        "status": 0,
                        "docs": None,
                        "reason": (
                            item.remark.replace("Leave Approved", "").strip()
                            if item.remark
                            else ""
                        )
                        or f"Teacher Marked: {type_label}",
                        "approve_by": None,
                        "approve_date": None,
                        "request_type": 99,
                        "is_attendance": True,
                        "attendance_type_label": type_label,
                    }
                )
            else:
                results.append(
                    {
                        "id": f"LV_{item.id}",
                        "student_session_id": item.student_session_id,
                        "student_name": student_name,
                        "class_name": class_name,
                        "section_name": section_name,
                        "from_date": (
                            item.from_date.strftime("%Y-%m-%d")
                            if item.from_date
                            else None
                        ),
                        "to_date": (
                            item.to_date.strftime("%Y-%m-%d") if item.to_date else None
                        ),
                        "apply_date": (
                            item.apply_date.strftime("%Y-%m-%d")
                            if item.apply_date
                            else None
                        ),
                        "status": item.status,
                        "docs": item.docs,
                        "reason": item.reason,
                        "approve_by": item.approve_by,
                        "approve_date": (
                            item.approve_date.strftime("%Y-%m-%d")
                            if item.approve_date
                            else None
                        ),
                        "request_type": item.request_type,
                        "is_attendance": False,
                        "attendance_type_label": None,
                    }
                )

        if paginated_items is not None:
            return {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": results,
            }

        return {"results": results, "count": len(results)}

    def create_leave(self, payload):
        roll_no = payload.get("roll_no")
        from_date = payload.get("from_date")
        to_date = payload.get("to_date")
        reason = payload.get("reason")
        docs = payload.get("docs", "")
        request_type = payload.get("request_type", 1)

        if not all([roll_no, from_date, to_date, reason]):
            raise AttendanceValidationError(
                "roll_no, from_date, to_date, and reason are required."
            )

        student = Students.objects.filter(roll_no=roll_no, is_active="yes").first()
        if not student:
            raise AttendanceNotFoundError(
                f"No active student found with roll number {roll_no}."
            )

        current_session = Sessions.objects.filter(is_active="yes").first()
        if current_session:
            student_session = StudentSession.objects.filter(
                student_id=student.id, session_id=current_session.id
            ).first()
        else:
            student_session = (
                StudentSession.objects.filter(student_id=student.id)
                .order_by("-id")
                .first()
            )

        if not student_session:
            raise AttendanceValidationError("Student has no active session.")

        try:
            lv = StudentApplyleave(
                student_session_id=student_session.id,
                from_date=datetime.datetime.strptime(from_date, "%Y-%m-%d").date(),
                to_date=datetime.datetime.strptime(to_date, "%Y-%m-%d").date(),
                apply_date=timezone.now().date(),
                status=0,
                docs=docs,
                reason=reason,
                request_type=int(request_type),
                created_at=timezone.now(),
            )
            lv.save()
        except django.db.utils.IntegrityError as e:
            if "foreign key constraint fails" in str(e).lower():
                raise AttendanceValidationError(
                    "Invalid student session ID. This student session does not exist."
                )
            raise AttendanceValidationError(f"Database error: {str(e)}")

        return {"id": f"LV_{lv.id}"}

    def get_record(self, pk):
        record, is_attendance = self._get_record(pk)
        if not record:
            raise AttendanceNotFoundError()

        if is_attendance:
            type_label = "Unknown"
            if record.attendence_type_id:
                att_type = AttendenceType.objects.filter(
                    id=record.attendence_type_id
                ).first()
                if att_type:
                    type_label = att_type.type

            return {
                "id": f"ATT_{record.id}",
                "student_session_id": record.student_session_id,
                "from_date": record.date.strftime("%Y-%m-%d") if record.date else None,
                "to_date": record.date.strftime("%Y-%m-%d") if record.date else None,
                "apply_date": record.date.strftime("%Y-%m-%d") if record.date else None,
                "status": 0,
                "docs": None,
                "reason": record.remark or f"Teacher Marked: {type_label}",
                "approve_by": None,
                "approve_date": None,
                "request_type": 99,
                "is_attendance": True,
                "attendance_type_label": type_label,
            }

        return {
            "id": f"LV_{record.id}",
            "student_session_id": record.student_session_id,
            "from_date": (
                record.from_date.strftime("%Y-%m-%d") if record.from_date else None
            ),
            "to_date": record.to_date.strftime("%Y-%m-%d") if record.to_date else None,
            "apply_date": (
                record.apply_date.strftime("%Y-%m-%d") if record.apply_date else None
            ),
            "status": record.status,
            "docs": record.docs,
            "reason": record.reason,
            "approve_by": record.approve_by,
            "approve_date": (
                record.approve_date.strftime("%Y-%m-%d")
                if record.approve_date
                else None
            ),
            "request_type": record.request_type,
            "is_attendance": False,
            "attendance_type_label": None,
        }

    def update_record(self, pk, payload, user):
        record, is_attendance = self._get_record(pk)
        if not record:
            raise AttendanceNotFoundError()

        try:
            if is_attendance:
                if "status" in payload:
                    new_status = int(payload["status"])
                    old_type = AttendenceType.objects.filter(
                        id=record.attendence_type_id
                    ).first()
                    old_label = old_type.type if old_type else "Exception"

                    staff = (
                        Staff.objects.filter(user_id=user.id).first()
                        if user is not None
                        else None
                    )

                    if new_status == 1:
                        present_type = AttendenceType.objects.filter(
                            type__iexact="Present"
                        ).first()
                        record.attendence_type_id = (
                            present_type.id if present_type else 1
                        )
                        record.save()
                    elif new_status == 2:
                        record.remark = f"[Rejected] {record.remark}"
                        record.save()

                    StudentApplyleave.objects.create(
                        student_session_id=record.student_session_id,
                        from_date=record.date,
                        to_date=record.date,
                        apply_date=record.date,
                        status=new_status,
                        reason=f"Teacher Marked: {old_label}"
                        + (
                            f" - {record.remark}"
                            if record.remark
                            and not record.remark.startswith("[Rejected]")
                            else ""
                        ),
                        approve_by=staff.id if staff else None,
                        approve_date=timezone.now().date(),
                        request_type=99,
                        created_at=timezone.now(),
                    )

                    return "Attendance exception processed successfully."
                return "No changes made to attendance exception."

            if "status" in payload:
                record.status = int(payload["status"])
                staff = (
                    Staff.objects.filter(user_id=user.id).first()
                    if user is not None
                    else None
                )
                record.approve_by = staff.id if staff else None
                record.approve_date = timezone.now().date()
            if "reason" in payload:
                record.reason = payload["reason"]
            if "from_date" in payload:
                record.from_date = datetime.datetime.strptime(
                    payload["from_date"], "%Y-%m-%d"
                ).date()
            if "to_date" in payload:
                record.to_date = datetime.datetime.strptime(
                    payload["to_date"], "%Y-%m-%d"
                ).date()

            if record.status == 1 and record.from_date and record.to_date:
                delta = record.to_date - record.from_date
                if delta.days >= 0:
                    for i in range(delta.days + 1):
                        day = record.from_date + timedelta(days=i)
                        present_type = AttendenceType.objects.filter(
                            type__iexact="Present"
                        ).first()
                        att, created = StudentAttendences.objects.get_or_create(
                            student_session_id=record.student_session_id,
                            date=day,
                            defaults={
                                "attendence_type_id": (
                                    present_type.id if present_type else 1
                                ),
                                "remark": "",
                                "is_active": "yes",
                                "created_at": timezone.now(),
                            },
                        )
                        if not created:
                            att.attendence_type_id = (
                                present_type.id if present_type else 1
                            )
                            att.save()

            record.save()
            return "Leave request updated successfully."
        except Exception as e:
            logger.error(f"Error updating record ID {pk}: {str(e)}")
            raise

    def delete_record(self, pk):
        record, _is_attendance = self._get_record(pk)
        if not record:
            raise AttendanceNotFoundError()

        try:
            record.delete()
        except Exception as e:
            logger.error(f"Error deleting record ID {pk}: {str(e)}")
            raise
