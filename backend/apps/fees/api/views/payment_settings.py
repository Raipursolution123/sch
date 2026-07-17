from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE
from apps.fees.services.payment_settings_service import PaymentSettingsService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "offline_bank_payments"


class PaymentGatewaysListView(APIView):
    """Read-only list of payment gateway settings (secrets masked)."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = PaymentSettingsService()
        qs = service.list_gateways()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = service.enrich_list(rows)
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Payment gateways retrieved successfully."
        )
