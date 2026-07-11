import logging

from rest_framework import status
from rest_framework.response import Response

from apps.attendance.domain.attendance_exceptions import (
    AttendanceError,
    AttendanceNotFoundError,
    AttendanceValidationError,
)
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)

MODULE = "student_attendance"


def attendance_error_response(exc: AttendanceError) -> Response:
    if isinstance(exc, AttendanceNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, AttendanceValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected attendance error: %s", exc)
    return APIResponse.error(
        message="Attendance operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
