from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.transport.api.views.transport_fees import transport_error_response
from apps.transport.domain.transport_exceptions import TransportError
from apps.transport.services.student_transport_fee_service import StudentTransportFeeService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "transport"
CATEGORY = "student_transport_fees"


class StudentTransportFeeRosterView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            class_id = int(request.query_params.get("class_id") or 0) or None
            section_id = int(request.query_params.get("section_id") or 0) or None
        except (TypeError, ValueError):
            class_id = section_id = None
        try:
            data = StudentTransportFeeService().get_roster(
                class_id=class_id, section_id=section_id
            )
            return APIResponse.success(data=data, message="Transport fee roster retrieved.")
        except TransportError as exc:
            return transport_error_response(exc)


class StudentTransportFeeAssignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_add"}

    def post(self, request):
        generated_by = getattr(request.user, "id", 0) or 0
        try:
            data = StudentTransportFeeService().assign(
                request.data, generated_by=generated_by
            )
            return APIResponse.success(data=data, message="Transport fees assigned.")
        except TransportError as exc:
            return transport_error_response(exc)
