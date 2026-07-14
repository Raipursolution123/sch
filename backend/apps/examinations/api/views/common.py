import logging

from rest_framework import status
from rest_framework.response import Response

from apps.examinations.domain.examination_exceptions import (
    ExaminationConflictError,
    ExaminationError,
    ExaminationNotFoundError,
    ExaminationValidationError,
)
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)

MODULE = "examination"


def examination_error_response(exc: ExaminationError) -> Response:
    if isinstance(exc, ExaminationNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (ExaminationValidationError, ExaminationConflictError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected examination error: %s", exc)
    return APIResponse.error(
        message="Examination operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
