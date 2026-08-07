from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.positive_fee_adjustment_service import PositiveFeeAdjustmentService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "fees_master"


class PositiveFeeAdjustmentListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        roster = request.query_params.get("roster")
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        try:
            service = PositiveFeeAdjustmentService()
            if roster in ("1", "true", "yes"):
                data = service.get_roster(
                    class_id=int(class_id) if class_id else None,
                    section_id=int(section_id) if section_id else None,
                )
                return APIResponse.success(data=data, message="Roster retrieved.")
            data = service.list_recent()
            return APIResponse.success(data=data, message="Positive fee adjustments retrieved.")
        except FeeError as exc:
            return fee_error_response(exc)


class PositiveFeeAdjustmentApplyView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_add"}

    def post(self, request):
        entry_by = getattr(request.user, "id", 0) or 0
        try:
            data = PositiveFeeAdjustmentService().apply_bulk(
                request.data, entry_by=entry_by
            )
            return APIResponse.success(
                data=data, message="Positive fee adjustments applied."
            )
        except FeeError as exc:
            return fee_error_response(exc)
