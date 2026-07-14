from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_leave_request_service import StaffLeaveRequestService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "approve_leave_request"


class StaffLeaveRequestsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        data = StaffLeaveRequestService().list_requests()
        return APIResponse.success(
            data=data, message="Staff leave requests retrieved successfully."
        )

    def post(self, request):
        try:
            data = StaffLeaveRequestService().create_request(request.data)
            return APIResponse.success(
                data=data,
                message="Leave request created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffLeaveRequestDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"PUT": "can_edit", "PATCH": "can_edit"}

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=StaffLeaveRequestService().get_request(pk),
                message="Leave request retrieved successfully.",
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def put(self, request, pk):
        try:
            data = StaffLeaveRequestService().update_status(pk, request.data)
            return APIResponse.success(
                data=data, message="Leave request updated successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)

    patch = put
