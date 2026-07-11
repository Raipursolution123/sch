from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_document_service import StaffDocumentService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

CATEGORY = "staff"


class StaffDocumentUploadView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_edit"}
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, pk):
        try:
            data = StaffDocumentService().upload_document(
                pk,
                document_type=request.data.get("document_type"),
                uploaded_file=request.FILES.get("file"),
                document_name=request.data.get("name", ""),
            )
            return APIResponse.success(
                data=data, message="Document uploaded successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)


class StaffDocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def delete(self, request, pk):
        try:
            StaffDocumentService().delete_document(
                pk,
                document_type=request.data.get("document_type"),
                document_id=request.data.get("document_id"),
            )
            return APIResponse.success(message="Document deleted successfully.")
        except StaffError as exc:
            return staff_error_response(exc)
