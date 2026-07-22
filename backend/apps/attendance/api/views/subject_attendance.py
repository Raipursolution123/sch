from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.attendance.api.views.common import MODULE, attendance_error_response
from apps.attendance.domain.attendance_exceptions import AttendanceError
from apps.attendance.services.subject_attendance_service import SubjectAttendanceService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "subject_attendance"


class SubjectAttendancePeriodsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            class_id = int(request.query_params.get("class_id") or 0)
            section_id = int(request.query_params.get("section_id") or 0)
        except (TypeError, ValueError):
            class_id = 0
            section_id = 0
        try:
            data = SubjectAttendanceService().list_periods(
                class_id=class_id,
                section_id=section_id,
                date_str=request.query_params.get("date") or "",
            )
            return APIResponse.success(data=data, message="Subject periods retrieved.")
        except AttendanceError as exc:
            return attendance_error_response(exc)


class SubjectAttendanceRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            period_id = int(request.query_params.get("subject_timetable_id") or 0)
        except (TypeError, ValueError):
            period_id = 0
        try:
            data = SubjectAttendanceService().get_roster(
                subject_timetable_id=period_id,
                date_str=request.query_params.get("date") or "",
            )
            return APIResponse.success(
                data=data, message="Subject attendance roster retrieved."
            )
        except AttendanceError as exc:
            return attendance_error_response(exc)


class SubjectAttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request):
        try:
            data = SubjectAttendanceService().mark(request.data)
            return APIResponse.success(data=data, message="Subject attendance saved.")
        except AttendanceError as exc:
            return attendance_error_response(exc)
