import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.session import (
    SessionCreateSerializer,
    SessionUpdateSerializer,
)
from apps.academics.domain.session_exceptions import (
    SessionCurrentError,
    SessionError,
    SessionInUseError,
    SessionLastError,
    SessionNotFoundError,
    SessionValidationError,
)
from apps.academics.selectors import session_selectors as selectors
from apps.academics.services.session_service import SessionService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

SESSION_MODULE = "system_settings"
SESSION_CATEGORY = "session_setting"


class SessionListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SESSION_MODULE
    legacy_permission_category = SESSION_CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        sessions_data = selectors.list_sessions_data(active_only=active_only)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(sessions_data, request, view=self)
        rows = page if page is not None else sessions_data

        if page is not None:
            return paginator.get_paginated_response(rows)

        return APIResponse.success(
            data={"sessions": rows},
            message="Sessions retrieved successfully.",
        )

    def post(self, request):
        serializer = SessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            data = SessionService().create_session(serializer.validated_data["session"])
            return APIResponse.success(
                data=data,
                message=f"Session '{data['session']}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SessionError as exc:
            return _session_error_response(exc)


class SessionActiveView(APIView):
    """Current school session — available to any authenticated staff user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = SessionService().get_active_session()
        if data is None:
            return APIResponse.error(
                message="No active academic session configured.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return APIResponse.success(
            data=data,
            message="Active session retrieved successfully.",
        )


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SESSION_MODULE
    legacy_permission_category = SESSION_CATEGORY

    def get(self, request, pk):
        try:
            data = SessionService().get_session(pk)
            return APIResponse.success(
                data=data,
                message="Session details retrieved successfully.",
            )
        except SessionError as exc:
            return _session_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = SessionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            data = SessionService().update_session(
                pk, serializer.validated_data["session"]
            )
            return APIResponse.success(
                data=data, message="Session updated successfully."
            )
        except SessionError as exc:
            return _session_error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                SessionService().delete_session(pk)
            return APIResponse.success(message="Session successfully deleted.")
        except SessionError as exc:
            return _session_error_response(exc)


class SessionActivateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = SESSION_MODULE
    legacy_permission_category = SESSION_CATEGORY
    legacy_permission_action = "can_edit"

    def post(self, request, pk):
        try:
            with transaction.atomic():
                data = SessionService().activate_session(pk)
            return APIResponse.success(
                data=data,
                message=f"Session '{data['session']}' is now active.",
            )
        except SessionError as exc:
            return _session_error_response(exc)


def _session_error_response(exc: SessionError) -> Response:
    if isinstance(exc, SessionNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, SessionInUseError):
        return APIResponse.error(
            message=exc.message,
            details={"references": exc.references},
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if isinstance(exc, (SessionCurrentError, SessionLastError, SessionValidationError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected session error: %s", exc)
    return APIResponse.error(
        message="Session operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
