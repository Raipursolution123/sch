from rest_framework.views import APIView

from apps.cyc_extensions.api.permissions import FINANCE_MODULE, FinanceIsAuthenticated
from apps.cyc_extensions.services.posting_service import PostingService
from common.responses.api import APIResponse


class TrialBalanceReportView(APIView):
    permission_classes = FinanceIsAuthenticated
    legacy_module_short_code = FINANCE_MODULE
    legacy_permission_category = "trialbalance"

    def get(self, request):
        service = PostingService()
        report_data = service.get_trial_balance()
        return APIResponse.success(
            data=report_data, message="Trial balance generated successfully"
        )
