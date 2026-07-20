from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.cyc_extensions.services.posting_service import PostingService
from common.responses.api import APIResponse


class TrialBalanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = PostingService()
        report_data = service.get_trial_balance()
        return APIResponse.success(
            data=report_data, message="Trial balance generated successfully"
        )
