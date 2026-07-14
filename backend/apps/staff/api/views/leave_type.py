from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.leave_type_service import LeaveTypeService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "leave_types"


class LeaveTypesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        data = LeaveTypeService().list_types()
        return APIResponse.success(
            data=data, message="Leave types retrieved successfully."
        )

    def post(self, request):
        try:
            data = LeaveTypeService().create_type(request.data)
            return APIResponse.success(
                data=data,
                message="Leave type created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class LeaveTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=LeaveTypeService().get_type(pk),
                message="Leave type retrieved successfully.",
            )
        except StaffError as exc:
            return staff_error_response(exc)

    def put(self, request, pk):
        try:
            data = LeaveTypeService().update_type(pk, request.data)
            return APIResponse.success(
                data=data, message="Leave type updated successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            LeaveTypeService().delete_type(pk)
            return APIResponse.success(message="Leave type deleted successfully.")
        except StaffError as exc:
            return staff_error_response(exc)
