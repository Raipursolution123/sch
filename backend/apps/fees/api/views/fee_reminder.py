from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.fee_reminder_service import FeeReminderService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "fees_reminder"


class FeeRemindersListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        data = FeeReminderService().list_reminders()
        return APIResponse.success(
            data=data, message="Fee reminders retrieved successfully."
        )


class FeeReminderDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"PUT": "can_edit", "PATCH": "can_edit"}

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=FeeReminderService().get_reminder(pk),
                message="Fee reminder retrieved successfully.",
            )
        except FeeError as exc:
            return fee_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = FeeReminderService().update_reminder(pk, request.data)
            return APIResponse.success(
                data=data, message="Fee reminder updated successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
