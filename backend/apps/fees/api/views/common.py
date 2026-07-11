import logging

from rest_framework import status
from rest_framework.response import Response

from apps.fees.domain.fee_exceptions import (
    FeeConflictError,
    FeeError,
    FeeNotFoundError,
    FeeValidationError,
)
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)

MODULE = "fees_collection"


def fee_error_response(exc: FeeError) -> Response:
    if isinstance(exc, FeeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (FeeValidationError, FeeConflictError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected fee error: %s", exc)
    return APIResponse.error(
        message="Fee operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
