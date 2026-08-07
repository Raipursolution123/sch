from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.domain.student_exceptions import (
    StudentError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.services.multi_class_service import MultiClassService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "multi_class"
CATEGORY = "multi_class_student"


def _error_response(exc: StudentError) -> Response:
    if isinstance(exc, StudentNotFoundError):
        return APIResponse.error(message=str(exc), status_code=status.HTTP_404_NOT_FOUND)
    if isinstance(exc, StudentValidationError):
        return APIResponse.error(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
    return APIResponse.error(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)


class MultiClassRosterView(APIView):
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
            data = MultiClassService().get_roster(class_id=class_id, section_id=section_id)
            return APIResponse.success(data=data, message="Multi-class roster retrieved.")
        except StudentError as exc:
            return _error_response(exc)


class MultiClassSaveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_method_actions = {"POST": "can_add"}

    def post(self, request):
        try:
            data = MultiClassService().save_enrollments(request.data)
            return APIResponse.success(data=data, message="Multi-class enrollments saved.")
        except StudentError as exc:
            return _error_response(exc)
