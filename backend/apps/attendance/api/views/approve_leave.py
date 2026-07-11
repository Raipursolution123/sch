from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.attendance.api.views.common import MODULE, attendance_error_response
from apps.attendance.domain.attendance_exceptions import AttendanceError
from apps.attendance.services.approve_leave_service import ApproveLeaveService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "approve_leave"


class ApproveLeaveListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            data = ApproveLeaveService().list_leave_requests(request)
            return APIResponse.success(
                data=data, message="Leave requests retrieved successfully."
            )
        except AttendanceError as exc:
            return attendance_error_response(exc)

    def post(self, request):
        try:
            data = ApproveLeaveService().create_leave(request.data)
            return APIResponse.success(
                data=data,
                message="Leave request created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except AttendanceError as exc:
            return attendance_error_response(exc)


class ApproveLeaveDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            data = ApproveLeaveService().get_record(pk)
            return APIResponse.success(
                data=data, message="Leave request retrieved successfully."
            )
        except AttendanceError as exc:
            return attendance_error_response(exc)

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        try:
            message = ApproveLeaveService().update_record(
                pk, request.data, request.user
            )
            return APIResponse.success(message=message)
        except AttendanceError as exc:
            return attendance_error_response(exc)

    def delete(self, request, pk):
        try:
            ApproveLeaveService().delete_record(pk)
            return APIResponse.success(message="Record deleted successfully.")
        except AttendanceError as exc:
            return attendance_error_response(exc)
