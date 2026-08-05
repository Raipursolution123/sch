from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.accounts.services.user_log_service import UserLogService
from apps.system.services.audit_log_service import AuditLogService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class UserLogListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "reports"
    legacy_permission_category = "userlog"

    def get(self, request):
        rows = UserLogService().list_logs(
            role=request.query_params.get("role"),
            q=request.query_params.get("q"),
            from_date=request.query_params.get("from_date"),
            to_date=request.query_params.get("to_date"),
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        if page is not None:
            return paginator.get_paginated_response(page)
        return APIResponse.success(data=rows, message="User logs retrieved.")


class AuditTrailListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "reports"
    legacy_permission_category = "audit_trail_report"

    def get(self, request):
        rows = AuditLogService().list_logs(
            action=request.query_params.get("action"),
            q=request.query_params.get("q"),
            from_date=request.query_params.get("from_date"),
            to_date=request.query_params.get("to_date"),
        )
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        if page is not None:
            return paginator.get_paginated_response(page)
        return APIResponse.success(data=rows, message="Audit trail retrieved.")
