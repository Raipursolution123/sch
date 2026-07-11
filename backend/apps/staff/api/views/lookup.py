from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE, staff_error_response
from apps.staff.domain.staff_exceptions import StaffError
from apps.staff.services.staff_document_service import StaffLookupService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "department"

    def get(self, request):
        try:
            data = StaffLookupService().list_departments()
            return APIResponse.success(
                data=data, message="Departments retrieved successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)


class DesignationListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "designation"

    def get(self, request):
        try:
            data = StaffLookupService().list_designations()
            return APIResponse.success(
                data=data, message="Designations retrieved successfully."
            )
        except StaffError as exc:
            return staff_error_response(exc)
