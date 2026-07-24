from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.documents.api.serializers.id_cards import (
    IdCardGenerateSerializer,
    IdCardPreviewSerializer,
    StaffIdCardCreateSerializer,
    StaffIdCardSerializer,
    StaffIdCardUpdateSerializer,
    StudentIdCardCreateSerializer,
    StudentIdCardSerializer,
    StudentIdCardUpdateSerializer,
)
from apps.documents.api.views.certificates import certificate_error_response
from apps.documents.domain.certificate_exceptions import CertificateError
from apps.documents.services.id_card_service import (
    StaffIdCardService,
    StudentIdCardService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "certificate"


def _paginated(request, view, qs, serializer_cls, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = list(page if page is not None else qs)
    data = serializer_cls(rows, many=True).data
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class StudentIdCardListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_id_card"

    def get(self, request):
        qs = StudentIdCardService().list(query=request.query_params.get("q"))
        return _paginated(
            request, self, qs, StudentIdCardSerializer, "Student ID templates retrieved."
        )

    def post(self, request):
        serializer = StudentIdCardCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StudentIdCardService().create(serializer.validated_data)
            return APIResponse.success(
                data=StudentIdCardSerializer(row).data,
                message="Student ID template created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CertificateError as exc:
            return certificate_error_response(exc)


class StudentIdCardDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "student_id_card"

    def get(self, request, pk):
        try:
            row = StudentIdCardService().get(pk)
            return APIResponse.success(data=StudentIdCardSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = StudentIdCardUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StudentIdCardService().update(pk, serializer.validated_data)
            return APIResponse.success(data=StudentIdCardSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def delete(self, request, pk):
        try:
            StudentIdCardService().delete(pk)
            return APIResponse.success(message="Student ID template deleted.")
        except CertificateError as exc:
            return certificate_error_response(exc)


class StudentIdCardGenerateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "generate_id_card"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        serializer = IdCardGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            preview = StudentIdCardService().preview(
                template_id=serializer.validated_data["template_id"],
                student_id=serializer.validated_data["person_id"],
            )
            return APIResponse.success(data=IdCardPreviewSerializer(preview).data)
        except CertificateError as exc:
            return certificate_error_response(exc)


class StaffIdCardListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_id_card"

    def get(self, request):
        qs = StaffIdCardService().list(query=request.query_params.get("q"))
        return _paginated(
            request, self, qs, StaffIdCardSerializer, "Staff ID templates retrieved."
        )

    def post(self, request):
        serializer = StaffIdCardCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StaffIdCardService().create(serializer.validated_data)
            return APIResponse.success(
                data=StaffIdCardSerializer(row).data,
                message="Staff ID template created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CertificateError as exc:
            return certificate_error_response(exc)


class StaffIdCardDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "staff_id_card"

    def get(self, request, pk):
        try:
            row = StaffIdCardService().get(pk)
            return APIResponse.success(data=StaffIdCardSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = StaffIdCardUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = StaffIdCardService().update(pk, serializer.validated_data)
            return APIResponse.success(data=StaffIdCardSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def delete(self, request, pk):
        try:
            StaffIdCardService().delete(pk)
            return APIResponse.success(message="Staff ID template deleted.")
        except CertificateError as exc:
            return certificate_error_response(exc)


class StaffIdCardGenerateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "generate_staff_id_card"
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request):
        serializer = IdCardGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            preview = StaffIdCardService().preview(
                template_id=serializer.validated_data["template_id"],
                staff_id=serializer.validated_data["person_id"],
            )
            return APIResponse.success(data=IdCardPreviewSerializer(preview).data)
        except CertificateError as exc:
            return certificate_error_response(exc)
