import logging
import datetime
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.db import transaction
import django.db.utils

from common.responses.api import APIResponse
from common.pagination.standard import StandardResultsSetPagination

from apps.students.models import StudentApplyleave, StudentSession, Students, StudentAttendences
from apps.academics.models import Classes, Sections, Sessions
from apps.attendance.models import AttendenceType
from apps.staff.models import Staff

logger = logging.getLogger(__name__)

class ApproveLeaveListCreateView(APIView):
    """List all student leave requests and half day attendances, or create a new leave."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        # 1. Get standard leave requests
        leaves_qs = list(StudentApplyleave.objects.all().order_by('-id'))

        # 2. Get attendance exceptions (Absent, Late, Holiday)
        target_types = AttendenceType.objects.filter(type__in=['Absent', 'Late', 'Holiday'])
        target_type_ids = [t.id for t in target_types]
        exceptions_qs = list(StudentAttendences.objects.filter(attendence_type_id__in=target_type_ids).exclude(remark__startswith='[Rejected]').order_by('-id'))

        def get_date(item):
            if hasattr(item, 'apply_date') and item.apply_date:
                return item.apply_date
            elif hasattr(item, 'date') and item.date:
                return item.date
            return datetime.date(1970, 1, 1)

        combined = leaves_qs + exceptions_qs
        combined.sort(key=get_date, reverse=True)

        paginator = StandardResultsSetPagination()
        paginated_items = paginator.paginate_queryset(combined, request, view=self)
        
        current_page_items = paginated_items if paginated_items is not None else combined

        # Optimization: Fetch related student info in bulk
        student_session_ids = [item.student_session_id for item in current_page_items if item.student_session_id]
        sessions = StudentSession.objects.filter(id__in=student_session_ids)
        session_map = {s.id: s for s in sessions}

        student_ids = [s.student_id for s in sessions if s.student_id]
        class_ids = [s.class_id for s in sessions if s.class_id]
        section_ids = [s.section_id for s in sessions if s.section_id]

        students = Students.objects.filter(id__in=student_ids)
        classes = Classes.objects.filter(id__in=class_ids)
        sections = Sections.objects.filter(id__in=section_ids)

        student_map = {s.id: f"{s.firstname or ''} {s.lastname or ''}".strip() for s in students}
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
                    att_type = AttendenceType.objects.filter(id=item.attendence_type_id).first()
                    if att_type:
                        type_label = att_type.type
                
                results.append({
                    'id': f"ATT_{item.id}",
                    'student_session_id': item.student_session_id,
                    'student_name': student_name,
                    'class_name': class_name,
                    'section_name': section_name,
                    'from_date': item.date.strftime('%Y-%m-%d') if item.date else None,
                    'to_date': item.date.strftime('%Y-%m-%d') if item.date else None,
                    'apply_date': item.date.strftime('%Y-%m-%d') if item.date else None,
                    'status': 0,
                    'docs': None,
                    'reason': (item.remark.replace('Leave Approved', '').strip() if item.remark else '') or f'Teacher Marked: {type_label}',
                    'approve_by': None,
                    'approve_date': None,
                    'request_type': 99,
                    'is_attendance': True,
                    'attendance_type_label': type_label,
                })
            else:
                results.append({
                    'id': f"LV_{item.id}",
                    'student_session_id': item.student_session_id,
                    'student_name': student_name,
                    'class_name': class_name,
                    'section_name': section_name,
                    'from_date': item.from_date.strftime('%Y-%m-%d') if item.from_date else None,
                    'to_date': item.to_date.strftime('%Y-%m-%d') if item.to_date else None,
                    'apply_date': item.apply_date.strftime('%Y-%m-%d') if item.apply_date else None,
                    'status': item.status,
                    'docs': item.docs,
                    'reason': item.reason,
                    'approve_by': item.approve_by,
                    'approve_date': item.approve_date.strftime('%Y-%m-%d') if item.approve_date else None,
                    'request_type': item.request_type,
                    'is_attendance': False,
                    'attendance_type_label': None,
                })

        if paginated_items is not None:
            return APIResponse.success(
                data={
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'results': results,
                },
                message='Leave requests retrieved successfully.',
            )

        return APIResponse.success(
            data={'results': results, 'count': len(results)},
            message='Leave requests retrieved successfully.',
        )

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        data = request.data
        try:
            roll_no = data.get('roll_no')
            from_date = data.get('from_date')
            to_date = data.get('to_date')
            reason = data.get('reason')
            docs = data.get('docs', '')
            request_type = data.get('request_type', 1)

            if not all([roll_no, from_date, to_date, reason]):
                return APIResponse.error(
                    message='roll_no, from_date, to_date, and reason are required.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            # Look up student by roll_no
            student = Students.objects.filter(roll_no=roll_no, is_active='yes').first()
            if not student:
                return APIResponse.error(
                    message=f"No active student found with roll number {roll_no}.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            # Look up active academic session
            current_session = Sessions.objects.filter(is_active='yes').first()
            if current_session:
                student_session = StudentSession.objects.filter(student_id=student.id, session_id=current_session.id).first()
            else:
                student_session = StudentSession.objects.filter(student_id=student.id).order_by('-id').first()

            if not student_session:
                return APIResponse.error(
                    message=f"Student has no active session.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            student_session_id = student_session.id

            lv = StudentApplyleave(
                student_session_id=student_session_id,
                from_date=datetime.datetime.strptime(from_date, '%Y-%m-%d').date(),
                to_date=datetime.datetime.strptime(to_date, '%Y-%m-%d').date(),
                apply_date=timezone.now().date(),
                status=0, # Pending
                docs=docs,
                reason=reason,
                request_type=int(request_type),
                created_at=timezone.now()
            )
            lv.save()

            return APIResponse.success(
                data={'id': f"LV_{lv.id}"},
                message='Leave request created successfully.',
                status_code=status.HTTP_201_CREATED,
            )
        except django.db.utils.IntegrityError as e:
            if 'foreign key constraint fails' in str(e).lower():
                return APIResponse.error(
                    message=f"Invalid student session ID. This student session does not exist.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Error creating leave request: {str(e)}")
            return APIResponse.error(
                message=f"Server error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ApproveLeaveDetailView(APIView):
    """Retrieve, update, or delete a specific leave request or half day attendance."""
    permission_classes = [AllowAny]

    def _get_record(self, pk):
        try:
            if str(pk).startswith("ATT_"):
                real_id = int(pk.replace("ATT_", ""))
                return StudentAttendences.objects.get(pk=real_id), True
            elif str(pk).startswith("LV_"):
                real_id = int(pk.replace("LV_", ""))
                return StudentApplyleave.objects.get(pk=real_id), False
            else:
                return StudentApplyleave.objects.get(pk=int(pk)), False
        except (StudentApplyleave.DoesNotExist, StudentAttendences.DoesNotExist, ValueError):
            return None, False

    def get(self, request, pk):
        record, is_attendance = self._get_record(pk)
        if not record:
            return APIResponse.error(message="Record not found.", status_code=status.HTTP_404_NOT_FOUND)

        if is_attendance:
            type_label = "Unknown"
            if record.attendence_type_id:
                att_type = AttendenceType.objects.filter(id=record.attendence_type_id).first()
                if att_type:
                    type_label = att_type.type
            
            return APIResponse.success(
                data={
                    'id': f"ATT_{record.id}",
                    'student_session_id': record.student_session_id,
                    'from_date': record.date.strftime('%Y-%m-%d') if record.date else None,
                    'to_date': record.date.strftime('%Y-%m-%d') if record.date else None,
                    'apply_date': record.date.strftime('%Y-%m-%d') if record.date else None,
                    'status': 0, # Pending
                    'docs': None,
                    'reason': record.remark or f'Teacher Marked: {type_label}',
                    'approve_by': None,
                    'approve_date': None,
                    'request_type': 99,
                    'is_attendance': True,
                    'attendance_type_label': type_label,
                },
                message="Leave request retrieved successfully."
            )
        else:
            return APIResponse.success(
                data={
                    'id': f"LV_{record.id}",
                    'student_session_id': record.student_session_id,
                    'from_date': record.from_date.strftime('%Y-%m-%d') if record.from_date else None,
                    'to_date': record.to_date.strftime('%Y-%m-%d') if record.to_date else None,
                    'apply_date': record.apply_date.strftime('%Y-%m-%d') if record.apply_date else None,
                    'status': record.status,
                    'docs': record.docs,
                    'reason': record.reason,
                    'approve_by': record.approve_by,
                    'approve_date': record.approve_date.strftime('%Y-%m-%d') if record.approve_date else None,
                    'request_type': record.request_type,
                    'is_attendance': False,
                    'attendance_type_label': None,
                },
                message="Leave request retrieved successfully."
            )

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        record, is_attendance = self._get_record(pk)
        if not record:
            return APIResponse.error(message="Record not found.", status_code=status.HTTP_404_NOT_FOUND)

        data = request.data
        try:
            if is_attendance:
                if 'status' in data:
                    new_status = int(data['status'])
                    old_type = AttendenceType.objects.filter(id=record.attendence_type_id).first()
                    old_label = old_type.type if old_type else 'Exception'

                    staff = Staff.objects.filter(user_id=request.user.id).first() if hasattr(request, 'user') else None

                    if new_status == 1:
                        # Approved: Mark as Present
                        present_type = AttendenceType.objects.filter(type__iexact='Present').first()
                        record.attendence_type_id = present_type.id if present_type else 1
                        record.save()
                    elif new_status == 2:
                        # Rejected: keep as Absent/Late, but mark remark so it disappears from exceptions
                        record.remark = f"[Rejected] {record.remark}"
                        record.save()

                    # Create StudentApplyleave record to keep it in the list persistently
                    StudentApplyleave.objects.create(
                        student_session_id=record.student_session_id,
                        from_date=record.date,
                        to_date=record.date,
                        apply_date=record.date,
                        status=new_status,
                        reason=f"Teacher Marked: {old_label}" + (f" - {record.remark}" if record.remark and not record.remark.startswith('[Rejected]') else ""),
                        approve_by=staff.id if staff else None,
                        approve_date=timezone.now().date(),
                        request_type=99,
                        created_at=timezone.now()
                    )

                    return APIResponse.success(message='Attendance exception processed successfully.')
                return APIResponse.success(message='No changes made to attendance exception.')
            else:
                if 'status' in data:
                    record.status = int(data['status'])
                    staff = Staff.objects.filter(user_id=request.user.id).first() if hasattr(request, 'user') else None
                    record.approve_by = staff.id if staff else None
                    record.approve_date = timezone.now().date()
                if 'reason' in data:
                    record.reason = data['reason']
                if 'from_date' in data:
                    record.from_date = datetime.datetime.strptime(data['from_date'], '%Y-%m-%d').date()
                if 'to_date' in data:
                    record.to_date = datetime.datetime.strptime(data['to_date'], '%Y-%m-%d').date()

                # If status became 1 (Approved), auto mark attendance as Present
                if record.status == 1 and record.from_date and record.to_date:
                    from datetime import timedelta
                    delta = record.to_date - record.from_date
                    if delta.days >= 0:
                        for i in range(delta.days + 1):
                            day = record.from_date + timedelta(days=i)
                            present_type = AttendenceType.objects.filter(type__iexact='Present').first()
                            att, created = StudentAttendences.objects.get_or_create(
                                student_session_id=record.student_session_id,
                                date=day,
                                defaults={
                                    'attendence_type_id': present_type.id if present_type else 1,
                                    'remark': '',
                                    'is_active': 'yes',
                                    'created_at': timezone.now()
                                }
                            )
                            if not created:
                                att.attendence_type_id = present_type.id if present_type else 1
                                att.save()

                record.save()
                return APIResponse.success(message='Leave request updated successfully.')
        except Exception as e:
            logger.error(f"Error updating record ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Server error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        record, is_attendance = self._get_record(pk)
        if not record:
            return APIResponse.error(message="Record not found.", status_code=status.HTTP_404_NOT_FOUND)

        try:
            record.delete()
            return APIResponse.success(message='Record deleted successfully.')
        except Exception as e:
            logger.error(f"Error deleting record ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Server error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class AttendanceTypeListView(APIView):
    """Retrieve all attendance types."""
    permission_classes = [AllowAny]

    def get(self, request):
        types = AttendenceType.objects.filter(is_active='yes')
        results = []
        for t in types:
            key_map = {
                'Present': 'present',
                'Absent': 'absent',
                'Late': 'late',
                'Half Day': 'half_day',
                'Holiday': 'holiday',
            }
            results.append({
                'id': t.id,
                'key': key_map.get(t.type, t.key_value.lower() if t.key_value else t.type.lower()),
                'label': t.type,
                'is_active': t.is_active,
            })
        return APIResponse.success(data=results, message="Attendance types retrieved successfully.")

class AttendanceRosterView(APIView):
    """Retrieve the attendance roster for a specific class, section, and date."""
    permission_classes = [AllowAny]

    def get(self, request):
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        date_str = request.query_params.get('date')

        if not all([class_id, section_id, date_str]):
            return APIResponse.error(
                message="class_id, section_id, and date are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return APIResponse.error(
                message="Invalid date format. Use YYYY-MM-DD.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            school_class = Classes.objects.get(pk=class_id)
            section = Sections.objects.get(pk=section_id)
        except (Classes.DoesNotExist, Sections.DoesNotExist):
            return APIResponse.error(message="Class or section not found.", status_code=status.HTTP_404_NOT_FOUND)

        current_session = Sessions.objects.filter(is_active='yes').first()
        if current_session:
            sessions = StudentSession.objects.filter(class_id=class_id, section_id=section_id, session_id=current_session.id)
        else:
            sessions = StudentSession.objects.filter(class_id=class_id, section_id=section_id)

        session_map = {s.student_id: s for s in sessions}

        students = Students.objects.filter(id__in=session_map.keys(), is_active='yes')

        session_ids = [s.id for s in sessions]
        attendances = StudentAttendences.objects.filter(student_session_id__in=session_ids, date=target_date)
        attendance_map = {a.student_session_id: a for a in attendances}

        types = AttendenceType.objects.all()
        type_map = {t.id: t for t in types}

        key_map = {
            'Present': 'present',
            'Absent': 'absent',
            'Late': 'late',
            'Half Day': 'half_day',
            'Holiday': 'holiday',
        }

        entries = []
        for student in students:
            sess = session_map.get(student.id)
            if not sess: continue

            record = attendance_map.get(sess.id)
            type_id = record.attendence_type_id if record else 1
            att_type = type_map.get(type_id)

            status_label = att_type.type if att_type else "Present"
            status_key = key_map.get(status_label, 'present')

            entries.append({
                'student_id': student.id,
                'admission_no': student.admission_no,
                'full_name': f"{student.firstname or ''} {student.lastname or ''}".strip(),
                'roll_no': student.roll_no,
                'attendence_type_id': type_id,
                'status_key': status_key,
                'status_label': status_label,
                'remark': record.remark if record else '',
            })

        entries.sort(key=lambda x: int(x['roll_no']) if x['roll_no'] and str(x['roll_no']).isdigit() else 999)

        data = {
            'class_id': int(class_id),
            'class_name': school_class.class_field,
            'section_id': int(section_id),
            'section_name': section.section,
            'date': date_str,
            'entries': entries,
        }

        return APIResponse.success(data=data, message="Roster retrieved successfully.")

class AttendanceMarkView(APIView):
    """Save the attendance roster for a specific class, section, and date."""
    permission_classes = [AllowAny]

    def post(self, request):
        class_id = request.data.get('class_id')
        section_id = request.data.get('section_id')
        date_str = request.data.get('date')
        entries = request.data.get('entries', [])

        if not all([class_id, section_id, date_str]):
            return APIResponse.error(
                message="class_id, section_id, and date are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return APIResponse.error(
                message="Invalid date format. Use YYYY-MM-DD.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        current_session = Sessions.objects.filter(is_active='yes').first()
        if current_session:
            sessions = StudentSession.objects.filter(class_id=class_id, section_id=section_id, session_id=current_session.id)
        else:
            sessions = StudentSession.objects.filter(class_id=class_id, section_id=section_id)
            
        session_map = {s.student_id: s for s in sessions}

        try:
            with transaction.atomic():
                for entry in entries:
                    student_id = entry.get('student_id')
                    type_id = entry.get('attendence_type_id')
                    remark = entry.get('remark', '')

                    sess = session_map.get(student_id)
                    if not sess:
                        continue

                    record, created = StudentAttendences.objects.get_or_create(
                        student_session_id=sess.id,
                        date=target_date,
                        defaults={
                            'attendence_type_id': type_id,
                            'remark': remark,
                            'created_at': timezone.now(),
                            'is_active': 'no',
                        }
                    )
                    if not created:
                        record.attendence_type_id = type_id
                        record.remark = remark
                        record.updated_at = timezone.now()
                        record.save()

            return APIResponse.success(message="Attendance marked successfully.")
        except Exception as e:
            logger.error(f"Error marking attendance: {str(e)}")
            return APIResponse.error(
                message=f"Server error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class AttendanceReportView(APIView):
    """Retrieve attendance report data."""
    permission_classes = [AllowAny]

    def get(self, request):
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        from_date_str = request.query_params.get('from_date')
        to_date_str = request.query_params.get('to_date')
        
        if not all([from_date_str, to_date_str]):
            return APIResponse.error(
                message="from_date and to_date are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from_date = datetime.datetime.strptime(from_date_str, '%Y-%m-%d').date()
            to_date = datetime.datetime.strptime(to_date_str, '%Y-%m-%d').date()
        except ValueError:
            return APIResponse.error(
                message="Invalid date format. Use YYYY-MM-DD.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        qs = StudentAttendences.objects.filter(date__gte=from_date, date__lte=to_date)
        
        current_session = Sessions.objects.filter(is_active='yes').first()

        if class_id or section_id or current_session:
            sessions_filter = {}
            if class_id:
                sessions_filter['class_id'] = class_id
            if section_id:
                sessions_filter['section_id'] = section_id
            if current_session:
                sessions_filter['session_id'] = current_session.id
            
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

        key_map = {
            'Present': 'present',
            'Absent': 'absent',
            'Late': 'late',
            'Half Day': 'half_day',
            'Holiday': 'holiday',
        }

        rows = []
        summary = {
            'present': 0,
            'absent': 0,
            'late': 0,
            'half_day': 0,
            'holiday': 0,
        }

        for r in records:
            sess = session_map.get(r.student_session_id)
            if not sess: continue
            
            student = student_map.get(sess.student_id)
            if not student: continue
            
            type_id = r.attendence_type_id
            att_type = type_map.get(type_id)
            status_label = att_type.type if att_type else "Present"
            status_key = key_map.get(status_label, 'present')

            if status_key in summary:
                summary[status_key] += 1
            else:
                summary['present'] += 1

            rows.append({
                'id': r.id,
                'student_id': student.id,
                'student_name': f"{student.firstname or ''} {student.lastname or ''}".strip(),
                'roll_no': student.roll_no,
                'class_name': class_map.get(sess.class_id, "—"),
                'section_name': section_map.get(sess.section_id, "—"),
                'date': r.date.strftime('%Y-%m-%d') if r.date else '',
                'status_key': status_key,
                'status_label': status_label,
                'remark': r.remark.replace('Leave Approved', '').strip() if r.remark else '',
            })

        rows.sort(key=lambda x: x['date'], reverse=True)

        data = {
            'total_records': len(rows),
            **summary,
            'rows': rows,
        }

        return APIResponse.success(data=data, message="Attendance report retrieved successfully.")
