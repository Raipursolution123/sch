from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.fee_collect_service import FeeCollectService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "collect_fees"


class FeeCollectRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")

        if not class_id or not section_id:
            return APIResponse.error(
                message="class_id and section_id are required.",
                status_code=400,
            )

        try:
            data = FeeCollectService().get_roster(int(class_id), int(section_id))
            return APIResponse.success(
                data=data, message="Fee collection roster retrieved successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
        except ValueError:
            return APIResponse.error(
                message="class_id and section_id must be valid integers.",
                status_code=400,
            )
