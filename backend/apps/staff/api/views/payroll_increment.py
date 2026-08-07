from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_payroll_increment_service import (
    StaffPayrollIncrementService,
)
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "staff"


class StaffPayrollIncrementListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        status_filter = request.query_params.get("status")
        data = StaffPayrollIncrementService().list_requests(status=status_filter)
        return APIResponse.success(
            data=data, message="Payroll increment requests retrieved successfully."
        )

    def post(self, request):
        try:
            entry_by = getattr(request.user, "user_id", None) or request.user.pk
            data = StaffPayrollIncrementService().create_request(
                request.data, entry_by=int(entry_by)
            )
            return APIResponse.success(
                data=data,
                message="Payroll increment request created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffPayrollIncrementApproveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request, pk):
        try:
            action_by = getattr(request.user, "user_id", None) or request.user.pk
            data = StaffPayrollIncrementService().approve(
                int(pk), action_by=int(action_by)
            )
            return APIResponse.success(
                data=data, message="Payroll increment approved successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffPayrollIncrementRejectView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request, pk):
        try:
            action_by = getattr(request.user, "user_id", None) or request.user.pk
            data = StaffPayrollIncrementService().reject(
                int(pk), action_by=int(action_by)
            )
            return APIResponse.success(
                data=data, message="Payroll increment rejected successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)
