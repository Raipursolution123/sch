import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.api.serializers.student_fee import StudentFeePaymentSerializer
from apps.students.domain.student_exceptions import (
    StudentError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.domain.student_fee_exceptions import (
    StudentEnrollmentError,
    StudentFeeError,
    StudentFeeNotFoundError,
    StudentFeeValidationError,
)
from apps.students.services.student_fee_service import StudentFeeService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "fees_collection"
CATEGORY = "collect_fees"


def _collected_by_label(user) -> str:
    name = user.get_full_name().strip() if hasattr(user, "get_full_name") else ""
    if not name:
        name = getattr(user, "username", "Staff")
    return f"{name}({user.id})"


class StudentFeesView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            data = StudentFeeService().get_fee_summary(pk)
            return APIResponse.success(data=data)
        except StudentError as exc:
            return _error_response(exc)

    def post(self, request, pk):
        serializer = StudentFeePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            StudentFeeService().record_payment(
                pk,
                serializer.validated_data,
                collected_by=_collected_by_label(request.user),
            )
            return APIResponse.success(message="Payment recorded successfully.")
        except StudentError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        payment_id = request.query_params.get("payment_id")
        feetype_id = request.query_params.get("feetype_id")

        try:
            if payment_id:
                StudentFeeService().delete_payment(str(payment_id))
                return APIResponse.success(message="Payment deleted successfully.")

            if not feetype_id:
                return APIResponse.error(
                    message="Fee type ID or payment ID is required for reverting.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            StudentFeeService().revert_fee(pk, int(feetype_id))
            return APIResponse.success(message="Payment reverted successfully.")
        except StudentError as exc:
            return _error_response(exc)


def _error_response(exc: StudentError) -> Response:
    if isinstance(exc, StudentNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(
        exc,
        (
            StudentValidationError,
            StudentFeeValidationError,
            StudentEnrollmentError,
        ),
    ):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    if isinstance(exc, StudentFeeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, StudentFeeError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected student fee error: %s", exc)
    return APIResponse.error(
        message="Student fee operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
