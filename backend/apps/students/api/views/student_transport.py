import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.students.api.serializers.student_transport import (
    StudentTransportUpdateSerializer,
)
from apps.students.domain.student_exceptions import (
    StudentError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.services.student_transport_service import StudentTransportService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)


class StudentTransportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "transport"
    legacy_permission_category = "assign_vehicle"

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=StudentTransportService().get_transport(pk),
                message="Student transport assignment retrieved successfully.",
            )
        except StudentError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        serializer = StudentTransportUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            data = StudentTransportService().update_transport(
                pk, serializer.validated_data
            )
            return APIResponse.success(
                data=data,
                message="Student transport assignment updated successfully.",
            )
        except StudentError as exc:
            return _error_response(exc)


def _error_response(exc: StudentError):
    if isinstance(exc, StudentNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, StudentValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected student transport error: %s", exc)
    return APIResponse.error(
        message="Student transport operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
