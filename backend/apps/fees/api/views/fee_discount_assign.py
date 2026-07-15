from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError
from apps.fees.services.fee_discount_assign_service import FeeDiscountAssignService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

# Legacy feediscount screen used fees_discount for index/edit/assign.
CATEGORY = "fees_discount"


class FeeDiscountAssignRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        class_id = request.query_params.get("class_id")
        section_id = request.query_params.get("section_id")
        fees_discount_id = request.query_params.get("fees_discount_id")
        if not class_id or not section_id or not fees_discount_id:
            return APIResponse.error(
                message="class_id, section_id, and fees_discount_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            data = FeeDiscountAssignService().get_roster(
                int(class_id), int(section_id), int(fees_discount_id)
            )
            return APIResponse.success(
                data=data, message="Discount assign roster retrieved successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message=(
                    "class_id, section_id, and fees_discount_id "
                    "must be valid integers."
                ),
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class FeeDiscountAssignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request):
        try:
            data = FeeDiscountAssignService().assign(
                fees_discount_id=int(request.data.get("fees_discount_id")),
                student_session_ids=list(request.data.get("student_session_ids") or []),
                description=request.data.get("description"),
            )
            return APIResponse.success(
                data=data,
                message="Fee discount assigned successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except FeeError as exc:
            return fee_error_response(exc)
        except (TypeError, ValueError):
            return APIResponse.error(
                message="Invalid assign payload.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )


class FeeDiscountUnassignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"DELETE": "can_delete"}

    def delete(self, request, pk):
        try:
            FeeDiscountAssignService().unassign(pk)
            return APIResponse.success(message="Fee discount assignment removed.")
        except FeeError as exc:
            return fee_error_response(exc)
