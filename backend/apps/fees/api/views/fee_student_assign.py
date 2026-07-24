from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.domain.fee_exceptions import FeeError, FeeValidationError
from apps.fees.services.fee_carry_forward_service import FeeCarryForwardService
from apps.fees.services.fee_student_assign_service import FeeStudentAssignService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class FeeStudentAssignRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "fees_group_assign"

    def get(self, request):
        try:
            fsg_id = int(request.query_params.get("fee_session_group_id") or 0)
        except (TypeError, ValueError):
            fsg_id = 0
        section_raw = request.query_params.get("section_id")
        try:
            section_id = int(section_raw) if section_raw not in (None, "") else None
        except (TypeError, ValueError):
            section_id = None
        try:
            data = FeeStudentAssignService().get_roster(
                fee_session_group_id=fsg_id, section_id=section_id
            )
            return APIResponse.success(
                data=data, message="Fee student assignment roster retrieved."
            )
        except FeeError as exc:
            return fee_error_response(exc)


class FeeStudentAssignSaveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "fees_group_assign"
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request):
        try:
            data = FeeStudentAssignService().save_assignments(request.data)
            return APIResponse.success(
                data=data, message="Fee student assignments saved."
            )
        except FeeError as exc:
            return fee_error_response(exc)


class FeeCarryForwardPreviewView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "fees_forward"

    def get(self, request):
        try:
            from_session_id = int(request.query_params.get("from_session_id") or 0)
            to_session_id = int(request.query_params.get("to_session_id") or 0)
            class_id = int(request.query_params.get("class_id") or 0)
            section_id = int(request.query_params.get("section_id") or 0)
        except (TypeError, ValueError):
            return fee_error_response(
                FeeValidationError(
                    "from_session_id, to_session_id, class_id, and section_id are required."
                )
            )
        try:
            data = FeeCarryForwardService().preview(
                from_session_id=from_session_id,
                to_session_id=to_session_id,
                class_id=class_id,
                section_id=section_id,
            )
            return APIResponse.success(
                data=data, message="Carry-forward preview retrieved."
            )
        except FeeError as exc:
            return fee_error_response(exc)


class FeeCarryForwardApplyView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "fees_forward"
    legacy_method_actions = {"POST": "can_add"}

    def post(self, request):
        try:
            data = FeeCarryForwardService().carry_forward(request.data)
            return APIResponse.success(
                data=data, message="Fees carried forward successfully."
            )
        except FeeError as exc:
            return fee_error_response(exc)
