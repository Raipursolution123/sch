from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.students.api.serializers.student_masters import (
    StudentCategoryCreateSerializer,
    StudentCategorySerializer,
    StudentCategoryUpdateSerializer,
    StudentHouseCreateSerializer,
    StudentHouseSerializer,
    StudentHouseUpdateSerializer,
    StudentImportRequestSerializer,
)
from apps.students.api.views.student import _error_response
from apps.students.domain.student_exceptions import StudentError
from apps.students.services.student_category_service import StudentCategoryService
from apps.students.services.student_house_service import (
    StudentHouseService,
    house_to_dict,
)
from apps.students.services.student_import_service import StudentImportService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "student_information"


class StudentCategoryListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_categories"

    def get(self, request):
        rows = StudentCategoryService().list(query=request.query_params.get("q"))
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        current = page if page is not None else rows
        data = StudentCategorySerializer(current, many=True).data
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(data=data, message="Student categories retrieved.")

    def post(self, request):
        serializer = StudentCategoryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StudentCategoryService().create(serializer.validated_data)
            return APIResponse.success(
                data=StudentCategorySerializer(row).data,
                message="Student category created.",
                status_code=status.HTTP_201_CREATED,
            )
        except StudentError as exc:
            return _error_response(exc)


class StudentCategoryDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_categories"

    def get(self, request, pk):
        try:
            row = StudentCategoryService().get(pk)
            return APIResponse.success(data=StudentCategorySerializer(row).data)
        except StudentError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = StudentCategoryUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StudentCategoryService().update(pk, serializer.validated_data)
            return APIResponse.success(data=StudentCategorySerializer(row).data)
        except StudentError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            StudentCategoryService().delete(pk)
            return APIResponse.success(message="Student category deleted.")
        except StudentError as exc:
            return _error_response(exc)


class StudentHouseListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_houses"

    def get(self, request):
        qs = StudentHouseService().list(query=request.query_params.get("q"))
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = StudentHouseSerializer([house_to_dict(r) for r in rows], many=True).data
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(data=data, message="Student houses retrieved.")

    def post(self, request):
        serializer = StudentHouseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StudentHouseService().create(serializer.validated_data)
            return APIResponse.success(
                data=StudentHouseSerializer(house_to_dict(row)).data,
                message="Student house created.",
                status_code=status.HTTP_201_CREATED,
            )
        except StudentError as exc:
            return _error_response(exc)


class StudentHouseDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_houses"

    def get(self, request, pk):
        try:
            row = StudentHouseService().get(pk)
            return APIResponse.success(
                data=StudentHouseSerializer(house_to_dict(row)).data
            )
        except StudentError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = StudentHouseUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StudentHouseService().update(pk, serializer.validated_data)
            return APIResponse.success(
                data=StudentHouseSerializer(house_to_dict(row)).data
            )
        except StudentError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            StudentHouseService().delete(pk)
            return APIResponse.success(message="Student house deleted.")
        except StudentError as exc:
            return _error_response(exc)


class StudentImportTemplateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "import_student"

    def get(self, request):
        return APIResponse.success(
            data=StudentImportService().template(),
            message="Student import template retrieved.",
        )


class StudentImportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "import_student"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        serializer = StudentImportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = StudentImportService().import_rows(
                serializer.validated_data["rows"]
            )
            return APIResponse.success(
                data=result,
                message=(
                    f"Imported {result['created_count']} student(s)"
                    f" with {result['error_count']} error(s)."
                ),
            )
        except StudentError as exc:
            return _error_response(exc)
