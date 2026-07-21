from datetime import datetime

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.offline_bank_payment_service import OfflineBankPaymentService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "offline_bank_payments"


def _optional_date(value: str | None, label: str):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


class OfflineBankPaymentsListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        status_filter = request.query_params.get("status", "pending")
        from_date_raw = request.query_params.get("from_date")
        to_date_raw = request.query_params.get("to_date")
        query = request.query_params.get("q")

        try:
            from_date = _optional_date(from_date_raw, "from_date")
            to_date = _optional_date(to_date_raw, "to_date")
            rows = OfflineBankPaymentService().list_payments(
                status=status_filter,
                from_date=from_date,
                to_date=to_date,
                query=query,
            )
            paginator = StandardResultsSetPagination()
            page = paginator.paginate_queryset(rows, request, view=self)
            data = page if page is not None else rows
            if page is not None:
                return paginator.get_paginated_response(data)
            return APIResponse.success(
                data=data,
                message="Offline bank payments retrieved successfully.",
            )
        except FeeError as exc:
            return fee_error_response(exc)
        except ValueError:
            return APIResponse.error(
                message="Invalid date filter. Use YYYY-MM-DD.",
                status_code=400,
            )


class OfflineBankPaymentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=OfflineBankPaymentService().get_payment_detail(pk),
                message="Offline bank payment retrieved successfully.",
            )
        except FeeError as exc:
            return fee_error_response(exc)


class OfflineBankPaymentApproveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    # Seed category typically only grants can_view.
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request, pk):
        try:
            staff_id = getattr(request.user, "user_id", None)
            reply = str(request.data.get("reply") or "")
            data = OfflineBankPaymentService().approve(
                pk, approved_by=staff_id, reply=reply
            )
            return APIResponse.success(
                data=data, message="Offline bank payment approved successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)


class OfflineBankPaymentRejectView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request, pk):
        try:
            staff_id = getattr(request.user, "user_id", None)
            reply = str(request.data.get("reply") or "")
            data = OfflineBankPaymentService().reject(
                pk, approved_by=staff_id, reply=reply
            )
            return APIResponse.success(
                data=data, message="Offline bank payment rejected successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
