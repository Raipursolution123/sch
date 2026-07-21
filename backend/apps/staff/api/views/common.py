import logging

from rest_framework import status
from rest_framework.response import Response

from apps.staff.domain.staff_exceptions import (
    StaffConflictError,
    StaffDocumentError,
    StaffError,
    StaffNotFoundError,
    StaffValidationError,
)
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)

MODULE = "human_resource"


def staff_error_response(exc: Exception) -> Response:
    if isinstance(exc, StaffNotFoundError):
        return APIResponse.error(
            message=getattr(exc, 'message', str(exc)), status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (StaffValidationError, StaffConflictError)):
        return APIResponse.error(
            message=getattr(exc, 'message', str(exc)), status_code=status.HTTP_400_BAD_REQUEST
        )
    if isinstance(exc, StaffDocumentError):
        return APIResponse.error(
            message=getattr(exc, 'message', str(exc)), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    logger.exception("Unexpected staff error: %s", exc)
    return APIResponse.error(
        message=f"Staff operation error: {str(exc)}",
        status_code=status.HTTP_400_BAD_REQUEST,
    )
