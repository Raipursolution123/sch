import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.class_teacher import (
    ClassTeacherCreateSerializer,
    ClassTeacherUpdateSerializer,
)
from apps.academics.domain.class_teacher_exceptions import (
    ClassTeacherError,
    ClassTeacherNotFoundError,
    ClassTeacherValidationError,
)
from apps.academics.services.class_teacher_service import ClassTeacherService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "academics"
CATEGORY = "assign_class_teacher"


def _parse_int_param(request, name: str) -> int | None:
    raw = request.query_params.get(name)
    if raw in (None, ""):
        return None
    try:
        return int(raw)
    except ValueError:
        return None


class ClassTeacherListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        session_id = _parse_int_param(request, "session_id")
        if session_id is None:
            return APIResponse.error(
                message="session_id is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        class_id = _parse_int_param(request, "class_id")
        section_id = _parse_int_param(request, "section_id")
        try:
            rows = ClassTeacherService().list_assignments(
                session_id, class_id, section_id
            )
            return APIResponse.success(
                data={"assignments": rows},
                message="Class teacher assignments retrieved successfully.",
            )
        except ClassTeacherError as exc:
            return _error_response(exc)

    def post(self, request):
        serializer = ClassTeacherCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = ClassTeacherService().assign_teacher(payload)
            return APIResponse.success(
                data=data,
                message="Class teacher assigned successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except ClassTeacherError as exc:
            return _error_response(exc)


class ClassTeacherDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=ClassTeacherService().get_assignment(pk),
                message="Class teacher assignment retrieved successfully.",
            )
        except ClassTeacherError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ClassTeacherUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = ClassTeacherService().update_assignment(pk, payload)
            return APIResponse.success(
                data=data,
                message="Class teacher assignment updated successfully.",
            )
        except ClassTeacherError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                ClassTeacherService().delete_assignment(pk)
            return APIResponse.success(
                message="Class teacher assignment removed successfully."
            )
        except ClassTeacherError as exc:
            return _error_response(exc)


def _error_response(exc: ClassTeacherError) -> Response:
    if isinstance(exc, ClassTeacherNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, ClassTeacherValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected class teacher error: %s", exc)
    return APIResponse.error(
        message="Class teacher operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
