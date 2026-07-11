import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.api.serializers.student import (
    StudentCreateSerializer,
    StudentUpdateSerializer,
)
from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.services.student_service import StudentService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "student_information"
CATEGORY = "student"


class StudentListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = StudentService()
        students_qs = service.list_students()

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
        try:
            with transaction.atomic():
                StudentService().delete_student(pk)
            return APIResponse.success(message="Student deleted successfully.")
        except StudentError as exc:
            return _error_response(exc)


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
