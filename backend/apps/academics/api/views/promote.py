import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.promote import PromoteExecuteSerializer
from apps.students.domain.promotion_exceptions import (
    PromotionError,
    PromotionNotFoundError,
    PromotionValidationError,
)
from apps.students.services.promotion_service import PromotionService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "academics"
CATEGORY = "promote_student"


def _parse_int_param(request, name: str) -> int | None:
    raw = request.query_params.get(name)
    if raw in (None, ""):
        return None
    try:
        return int(raw)
    except ValueError:
        return None


def _require_params(
    request, names: list[str]
) -> tuple[dict[str, int] | None, Response | None]:
    values: dict[str, int] = {}
    for name in names:
        parsed = _parse_int_param(request, name)
        if parsed is None:
            return None, APIResponse.error(
                message=f"{name} is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        values[name] = parsed
    return values, None


class PromotePreviewView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        params, error = _require_params(
            request,
            [
                "from_session_id",
                "from_class_id",
                "from_section_id",
                "to_session_id",
                "to_class_id",
                "to_section_id",
            ],
        )
        if error:
            return error
        try:
            data = PromotionService().preview(**params)
            return APIResponse.success(
                data=data,
                message="Promotion preview generated successfully.",
            )
        except PromotionError as exc:
            return _error_response(exc)


class PromoteExecuteView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_permission_action = "can_view"

    def post(self, request):
        serializer = PromoteExecuteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        try:
            data = PromotionService().execute(payload)
            return APIResponse.success(
                data=data,
                message="Students promoted successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except PromotionError as exc:
            return _error_response(exc)


def _error_response(exc: PromotionError) -> Response:
    if isinstance(exc, PromotionNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, PromotionValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected promotion error: %s", exc)
    return APIResponse.error(
        message="Promotion operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
