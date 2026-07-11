from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.attendance.api.views.common import MODULE, attendance_error_response
from apps.attendance.domain.attendance_exceptions import AttendanceError
from apps.attendance.services.attendance_service import AttendanceService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "student_attendance"


class AttendanceTypeListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        data = AttendanceService().list_types()
        return APIResponse.success(
            data=data, message="Attendance types retrieved successfully."
        )


class AttendanceRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            data = AttendanceService().get_roster(
                request.query_params.get("class_id"),
                request.query_params.get("section_id"),
                request.query_params.get("date"),
            )
            return APIResponse.success(
                data=data, message="Roster retrieved successfully."
            )
        except AttendanceError as exc:
            return attendance_error_response(exc)


class AttendanceMarkView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request):
        try:
            AttendanceService().mark_attendance(request.data)
            return APIResponse.success(message="Attendance marked successfully.")
        except AttendanceError as exc:
            return attendance_error_response(exc)


class AttendanceReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "attendance_report"

    def get(self, request):
        try:
            data = AttendanceService().get_report(
                {
                    "from_date": request.query_params.get("from_date"),
                    "to_date": request.query_params.get("to_date"),
                    "class_id": request.query_params.get("class_id"),
                    "section_id": request.query_params.get("section_id"),
                }
            )
            return APIResponse.success(
                data=data, message="Attendance report retrieved successfully."
            )
        except AttendanceError as exc:
            return attendance_error_response(exc)
