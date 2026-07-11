import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.timetable import (
    TimetableCreateSerializer,
    TimetableUpdateSerializer,
)
from apps.academics.domain.timetable_exceptions import (
    TimetableConflictError,
    TimetableError,
    TimetableInUseError,
    TimetableNotFoundError,
    TimetableValidationError,
)
from apps.academics.services.timetable_service import TimetableService
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "academics"
CATEGORY = "class_timetable"


def _parse_int_param(request, name: str) -> int | None:
    raw = request.query_params.get(name)
    if raw in (None, ""):
        return None
    try:
        return int(raw)
    except ValueError:
        return None


class TimetableListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        session_id = _parse_int_param(request, "session_id")
        class_id = _parse_int_param(request, "class_id")
        section_id = _parse_int_param(request, "section_id")
        if session_id is None or class_id is None or section_id is None:
            return APIResponse.error(
                message="session_id, class_id, and section_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            periods = TimetableService().list_periods(session_id, class_id, section_id)
            return APIResponse.success(
                data={"periods": periods},
                message="Timetable periods retrieved successfully.",
            )
        except TimetableError as exc:
            return _error_response(exc)

    def post(self, request):
        serializer = TimetableCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = TimetableService().create_period(payload)
            return APIResponse.success(
                data=data,
                message="Timetable period created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except TimetableError as exc:
            return _error_response(exc)


class TimetableSubjectOptionsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        session_id = _parse_int_param(request, "session_id")
        class_id = _parse_int_param(request, "class_id")
        section_id = _parse_int_param(request, "section_id")
        if session_id is None or class_id is None or section_id is None:
            return APIResponse.error(
                message="session_id, class_id, and section_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            options = TimetableService().subject_options(
                session_id, class_id, section_id
            )
            return APIResponse.success(
                data={"options": options},
                message="Timetable subject options retrieved successfully.",
            )
        except TimetableError as exc:
            return _error_response(exc)


class TeacherTimetableView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "teachers_time_table"

    def get(self, request):
        session_id = _parse_int_param(request, "session_id")
        staff_id = _parse_int_param(request, "staff_id")
        if session_id is None or staff_id is None:
            return APIResponse.error(
                message="session_id and staff_id are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            periods = TimetableService().list_staff_periods(session_id, staff_id)
            return APIResponse.success(
                data={"periods": periods},
                message="Teacher timetable retrieved successfully.",
            )
        except TimetableError as exc:
            return _error_response(exc)


class TimetableDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=TimetableService().get_period(pk),
                message="Timetable period retrieved successfully.",
            )
        except TimetableError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = TimetableUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = TimetableService().update_period(pk, payload)
            return APIResponse.success(
                data=data, message="Timetable period updated successfully."
            )
        except TimetableError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                TimetableService().delete_period(pk)
            return APIResponse.success(message="Timetable period deleted successfully.")
        except TimetableError as exc:
            return _error_response(exc)


def _error_response(exc: TimetableError) -> Response:
    if isinstance(exc, TimetableNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(
        exc, (TimetableValidationError, TimetableConflictError, TimetableInUseError)
    ):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected timetable error: %s", exc)
    return APIResponse.error(
        message="Timetable operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
