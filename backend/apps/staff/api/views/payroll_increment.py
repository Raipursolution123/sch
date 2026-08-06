from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_payroll_increment_service import StaffPayrollIncrementService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _paginated(request, view, rows, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = page if page is not None else rows
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class StaffPayrollIncrementListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "payroll_increment"

    def get(self, request):
        try:
            rows = StaffPayrollIncrementService().list()
            return _paginated(request, self, rows, "Payroll increments retrieved.")
        except Exception as exc:
            return staff_error_response(exc)

    def post(self, request):
        try:
            # We get user id for entry_by. For safety, default to request.user.id or staff id if available.
            entry_by = request.user.id if request.user else 0
            data = StaffPayrollIncrementService().create(request.data, entry_by=entry_by)
            return APIResponse.success(
                data=data,
                message="Payroll increment request created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return staff_error_response(exc)


class StaffPayrollIncrementDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "payroll_increment"

    def delete(self, request, pk):
        try:
            StaffPayrollIncrementService().delete(pk)
            return APIResponse.success(message="Payroll increment request deleted successfully.")
        except Exception as exc:
            return staff_error_response(exc)


class StaffPayrollIncrementApproveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "payroll_increment_approve"

    def post(self, request, pk):
        try:
            action_by = request.user.id if request.user else 0
            res = StaffPayrollIncrementService().approve(pk, action_by=action_by)
            return APIResponse.success(data=res, message="Payroll increment approved.")
        except Exception as exc:
            return staff_error_response(exc)


class StaffPayrollIncrementRejectView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "payroll_increment_approve"

    def post(self, request, pk):
        try:
            action_by = request.user.id if request.user else 0
            res = StaffPayrollIncrementService().reject(pk, action_by=action_by)
            return APIResponse.success(data=res, message="Payroll increment request rejected.")
        except Exception as exc:
            return staff_error_response(exc)
