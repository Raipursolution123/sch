from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.attendance.api.views.common import MODULE, attendance_error_response
from apps.attendance.domain.attendance_exceptions import AttendanceError
from apps.attendance.services.hostel_attendance_service import HostelAttendanceService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "student_attendance"


class HostelAttendanceRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            hostel_id = int(request.query_params.get("hostel_id") or 0)
            date_str = request.query_params.get("date") or ""
        except (TypeError, ValueError):
            hostel_id = 0
            date_str = ""
        try:
            data = HostelAttendanceService().get_roster(
                hostel_id=hostel_id, date_str=date_str
            )
            return APIResponse.success(data=data, message="Hostel attendance roster retrieved.")
        except AttendanceError as exc:
            return attendance_error_response(exc)


class HostelAttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_add"}

    def post(self, request):
        try:
            data = HostelAttendanceService().mark_attendance(request.data)
            return APIResponse.success(data=data, message="Hostel attendance saved.")
        except AttendanceError as exc:
            return attendance_error_response(exc)
