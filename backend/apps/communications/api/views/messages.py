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
from apps.communications.services.message_service import MessageService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "communicate"


def message_error_response(exc: NotificationError) -> Response:
    if isinstance(exc, NotificationNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, NotificationValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected message error: %s", exc)
    return APIResponse.error(
        message="Message operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _paginated(request, view, rows, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = page if page is not None else rows
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class MessagesListView(APIView):
    """Email / SMS send log (legacy email_sms_log)."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "email_sms_log"

    def get(self, request):
        rows = MessageService().list_messages(
            channel=request.query_params.get("channel")
        )
        return _paginated(request, self, rows, "Messages retrieved successfully.")


class EmailComposeView(APIView):
    """Compose email — seed grants can_view only on `email`."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "email"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        try:
            data = MessageService().compose(request.data, channel="email")
            return APIResponse.success(
                data=data,
                message="Email queued successfully. Delivery will run when SMTP is configured.",
                status_code=status.HTTP_201_CREATED,
            )
        except NotificationError as exc:
            return message_error_response(exc)


class SmsComposeView(APIView):
    """Compose SMS — seed grants can_view only on `sms`."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "sms"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        try:
            data = MessageService().compose(request.data, channel="sms")
            return APIResponse.success(
                data=data,
                message="SMS queued successfully. Delivery will run when SMS gateway is configured.",
                status_code=status.HTTP_201_CREATED,
            )
        except NotificationError as exc:
            return message_error_response(exc)


class BulkEmailView(APIView):
    """Bulk email to class students — privilege `login_credentials_send`."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "login_credentials_send"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        try:
            data = MessageService().bulk_email_to_students(request.data)
            return APIResponse.success(
                data=data,
                message=(
                    f"Bulk email queued for {data.get('recipient_count', 0)} recipients. "
                    "Delivery will run when SMTP is configured."
                ),
                status_code=status.HTTP_201_CREATED,
            )
        except NotificationError as exc:
            return message_error_response(exc)
