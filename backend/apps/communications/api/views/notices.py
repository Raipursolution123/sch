import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.communications.domain.notification_exceptions import (
    NotificationError,
    NotificationNotFoundError,
    NotificationValidationError,
)
from apps.communications.services.notification_service import NotificationService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "communicate"
CATEGORY = "notice_board"


def notification_error_response(exc: NotificationError) -> Response:
    if isinstance(exc, NotificationNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, NotificationValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected notification error: %s", exc)
    return APIResponse.error(
        message="Notification operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class NoticesListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = NotificationService()
        qs = service.list_notices()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = service.enrich_list(rows)
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(data=data, message="Notices retrieved successfully.")

    def post(self, request):
        try:
            data = NotificationService().create_notice(request.data)
            return APIResponse.success(
                data=data,
                message="Notice created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except NotificationError as exc:
            return notification_error_response(exc)


class NoticesDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=NotificationService().get_notice(pk),
                message="Notice retrieved successfully.",
            )
        except NotificationError as exc:
            return notification_error_response(exc)

    def put(self, request, pk):
        try:
            data = NotificationService().update_notice(pk, request.data)
            return APIResponse.success(
                data=data, message="Notice updated successfully."
            )
        except NotificationError as exc:
            return notification_error_response(exc)

    patch = put

    def delete(self, request, pk):
        try:
            NotificationService().delete_notice(pk)
            return APIResponse.success(message="Notice deleted successfully.")
        except NotificationError as exc:
            return notification_error_response(exc)
