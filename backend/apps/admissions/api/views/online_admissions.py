from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.admissions.api.serializers.online_admissions import (
    OnlineAdmissionConvertSerializer,
    OnlineAdmissionCreateSerializer,
    OnlineAdmissionSerializer,
    OnlineAdmissionUpdateSerializer,
)
from apps.admissions.domain.admissions_exceptions import (
    AdmissionsConflictError,
    AdmissionsError,
    AdmissionsNotFoundError,
)
from apps.admissions.services.online_admission_service import OnlineAdmissionService
from apps.students.domain.student_exceptions import StudentError
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "online_admission"
CATEGORY = "online_admission"


def admissions_error_response(exc: Exception):
    if isinstance(exc, AdmissionsNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, AdmissionsConflictError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_409_CONFLICT
        )
    if isinstance(exc, (AdmissionsError, StudentError)):
        return APIResponse.error(
            message=getattr(exc, "message", str(exc)),
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    return APIResponse.error(
        message="Admissions operation failed.",
        status_code=status.HTTP_400_BAD_REQUEST,
    )


class OnlineAdmissionListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = OnlineAdmissionService()
        qs = service.list_admissions()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = OnlineAdmissionSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Online admissions retrieved successfully."
        )

    def post(self, request):
        serializer = OnlineAdmissionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            admission = OnlineAdmissionService().create_admission(
                serializer.validated_data
            )
            response_serializer = OnlineAdmissionSerializer(admission)
            return APIResponse.success(
                data=response_serializer.data,
                message="Online admission created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return admissions_error_response(exc)


class OnlineAdmissionDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            admission = OnlineAdmissionService().get_admission(pk)
            serializer = OnlineAdmissionSerializer(admission)
            return APIResponse.success(
                data=serializer.data,
                message="Online admission retrieved successfully.",
            )
        except Exception as exc:
            return admissions_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = OnlineAdmissionUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            admission = OnlineAdmissionService().update_admission(
                pk, serializer.validated_data
            )
            response_serializer = OnlineAdmissionSerializer(admission)
            return APIResponse.success(
                data=response_serializer.data,
                message="Online admission updated successfully.",
            )
        except Exception as exc:
            return admissions_error_response(exc)


class OnlineAdmissionConvertView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_permission_action = "can_edit"

    def post(self, request, pk):
        serializer = OnlineAdmissionConvertSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            result = OnlineAdmissionService().convert_to_student(
                pk, serializer.validated_data
            )
            return APIResponse.success(
                data=result,
                message="Online admission converted to student successfully.",
            )
        except Exception as exc:
            return admissions_error_response(exc)
