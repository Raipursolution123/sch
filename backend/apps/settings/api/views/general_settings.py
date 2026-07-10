import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.settings.api.serializers.general_settings import (
    GeneralSettingsUpdateSerializer,
)
from apps.settings.domain.general_settings_exceptions import (
    GeneralSettingsError,
    GeneralSettingsReadOnlyError,
    GeneralSettingsValidationError,
    SchSettingsNotFoundError,
)
from apps.settings.services.general_settings_service import GeneralSettingsService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

SETTINGS_MODULE = "system_settings"
SETTINGS_CATEGORY = "general_setting"


class GeneralSettingsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SETTINGS_MODULE
    legacy_permission_category = SETTINGS_CATEGORY

    def get(self, request):
        try:
            data = GeneralSettingsService().get_settings()
            return APIResponse.success(
                data=data,
                message="General settings retrieved successfully.",
            )
        except GeneralSettingsError as exc:
            return _settings_error_response(exc)

    def put(self, request):
        return self.patch(request)

    def patch(self, request):
        serializer = GeneralSettingsUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Preserve raw keys so domain can reject unknown / read-only fields.
        payload = {key: request.data.get(key) for key in request.data.keys()}
        try:
            with transaction.atomic():
                data = GeneralSettingsService().update_settings(payload)
            return APIResponse.success(
                data=data,
                message="General settings updated successfully.",
            )
        except GeneralSettingsError as exc:
            return _settings_error_response(exc)


def _settings_error_response(exc: GeneralSettingsError) -> Response:
    if isinstance(exc, SchSettingsNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (GeneralSettingsValidationError, GeneralSettingsReadOnlyError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected general settings error: %s", exc)
    return APIResponse.error(
        message="General settings operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
