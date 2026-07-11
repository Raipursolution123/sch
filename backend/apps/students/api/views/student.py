import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.models import Sessions
from apps.students.api.serializers.student import (
    StudentCreateSerializer,
    StudentUpdateSerializer,
)
from apps.students.api.serializers.student_disable import StudentDisableSerializer
from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.models.student_session import StudentSession
from apps.students.selectors import student_selectors as selectors
from apps.students.services.student_service import StudentService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "student_information"
CATEGORY = "student"
DISABLE_CATEGORY = "disable_student"


class StudentListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def initial(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status", "active")
        if status_filter == "disabled":
            self.legacy_permission_category = DISABLE_CATEGORY
        else:
            self.legacy_permission_category = CATEGORY
        super().initial(request, *args, **kwargs)

    def get(self, request):
        service = StudentService()
        status_filter = request.query_params.get("status", "active")
        if status_filter not in {"active", "disabled", "all"}:
            return APIResponse.error(
                message="Invalid status filter. Use active, disabled, or all.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        students_qs = service.list_students(status=status_filter)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(students_qs, request, view=self)
        rows = page if page is not None else students_qs
        data = service.enrich_list_page(rows)

        if page is not None:
            return paginator.get_paginated_response(data)

        return APIResponse.success(
            data=data, message="Students retrieved successfully."
        )

    def post(self, request):
        serializer = StudentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {**request.data, **serializer.validated_data}
        try:
            data = StudentService().admit_student(payload)
            return APIResponse.success(
                data=data,
                message="Student created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except StudentError as exc:
            return _error_response(exc)


class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def initial(self, request, *args, **kwargs):
        if request.method == "DELETE":
            self.legacy_permission_category = DISABLE_CATEGORY
        else:
            self.legacy_permission_category = CATEGORY
        super().initial(request, *args, **kwargs)

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=StudentService().get_student(pk),
                message="Student details retrieved successfully.",
            )
        except StudentError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = StudentUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = StudentService().update_student(pk, payload)
            return APIResponse.success(
                data=data, message="Student updated successfully."
            )
        except StudentError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        serializer = StudentDisableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                StudentService().disable_student(pk, serializer.validated_data)
            return APIResponse.success(message="Student disabled successfully.")
        except StudentError as exc:
            return _error_response(exc)


class StudentDisableReasonListView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = DISABLE_CATEGORY

    def get(self, request):
        return APIResponse.success(
            data=StudentService().list_disable_reasons(),
            message="Disable reasons retrieved successfully.",
        )


class StudentEnableView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = DISABLE_CATEGORY
    legacy_method_actions = {"POST": "can_edit"}

    def post(self, request, pk):
        try:
            with transaction.atomic():
                StudentService().enable_student(pk)
            return APIResponse.success(message="Student re-enabled successfully.")
        except StudentError as exc:
            return _error_response(exc)


class StudentAcademicSessionsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, student_id):
        if not selectors.get_student_by_id(student_id):
            return APIResponse.error(
                message="Student not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        session_ids = (
            StudentSession.objects.filter(student_id=student_id)
            .values_list("session_id", flat=True)
            .distinct()
        )
        sessions = Sessions.objects.filter(id__in=session_ids).order_by("id")

        from apps.settings.models.sch_settings import SchSettings

        sch_setting = SchSettings.objects.first()
        active_session_id = sch_setting.session_id if sch_setting else 0

        sessions_data = []
        for session in sessions:
            sessions_data.append(
                {
                    "id": session.id,
                    "session": session.session,
                    "is_active": session.is_active,
                    "active": session.id if session.id == active_session_id else 0,
                    "created_at": (
                        session.created_at.strftime("%Y-%m-%d %H:%M:%S")
                        if session.created_at
                        else None
                    ),
                    "updated_at": (
                        session.updated_at.strftime("%Y-%m-%d")
                        if session.updated_at
                        else None
                    ),
                }
            )

        return APIResponse.success(
            data={"sessions": sessions_data},
            message="Student academic sessions retrieved successfully.",
        )


def _error_response(exc: StudentError) -> Response:
    if isinstance(exc, StudentNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (StudentValidationError, StudentConflictError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected student error: %s", exc)
    return APIResponse.error(
        message="Student operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
