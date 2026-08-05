import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.staff.api.views.common import MODULE
from apps.staff.services.staff_rating_service import StaffRatingService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)
CATEGORY = "teachers_rating"


def _error(exc: Exception):
    if isinstance(exc, LookupError):
        return APIResponse.error(message=str(exc), status_code=status.HTTP_404_NOT_FOUND)
    if isinstance(exc, ValueError):
        return APIResponse.error(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
    logger.exception("Staff rating error: %s", exc)
    return APIResponse.error(
        message="Staff rating operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class StaffRatingListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        status_raw = request.query_params.get("status")
        status_filter = None
        if status_raw not in (None, ""):
            try:
                status_filter = int(status_raw)
            except (TypeError, ValueError):
                return APIResponse.error(
                    message="status must be 0 or 1.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        try:
            data = StaffRatingService().list_ratings(status=status_filter)
            return APIResponse.success(data=data, message="Staff ratings retrieved.")
        except Exception as exc:
            return _error(exc)


class StaffRatingApproveView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request, pk):
        try:
            data = StaffRatingService().approve(pk)
            return APIResponse.success(data=data, message="Rating approved.")
        except Exception as exc:
            return _error(exc)


class StaffRatingDeclineView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def post(self, request, pk):
        try:
            data = StaffRatingService().decline(pk)
            return APIResponse.success(data=data, message="Rating declined.")
        except Exception as exc:
            return _error(exc)


class StaffRatingDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def delete(self, request, pk):
        try:
            StaffRatingService().delete(pk)
            return APIResponse.success(message="Rating deleted.")
        except Exception as exc:
            return _error(exc)
