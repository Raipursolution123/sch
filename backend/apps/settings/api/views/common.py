import logging

from rest_framework import status
from rest_framework.response import Response

from apps.settings.domain.settings_exceptions import (
    SettingsConflictError,
    SettingsError,
    SettingsNotFoundError,
    SettingsValidationError,
)
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)

SETTINGS_MODULE = "system_settings"


def settings_error_response(exc: SettingsError) -> Response:
    if isinstance(exc, SettingsNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (SettingsValidationError, SettingsConflictError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected settings error: %s", exc)
    return APIResponse.error(
        message="Settings operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
