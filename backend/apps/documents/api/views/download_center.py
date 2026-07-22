from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.documents.api.serializers.download_center import (
    ContentTypeCreateSerializer,
    ContentTypeSerializer,
    ContentTypeUpdateSerializer,
    UploadContentCreateSerializer,
    UploadContentSerializer,
)
from apps.documents.api.views.certificates import certificate_error_response
from apps.documents.domain.certificate_exceptions import CertificateError
from apps.documents.services.download_center_service import (
    ContentTypeService,
    UploadContentService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "download_center"


def _paginated(request, view, qs, serializer_cls, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request, view=view)
    rows = list(page if page is not None else qs)
    data = serializer_cls(rows, many=True).data
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class ContentTypeListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "content_type"

    def get(self, request):
        qs = ContentTypeService().list(query=request.query_params.get("q"))
        return _paginated(
            request, self, qs, ContentTypeSerializer, "Content types retrieved."
        )

    def post(self, request):
        serializer = ContentTypeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = ContentTypeService().create(serializer.validated_data)
            return APIResponse.success(
                data=ContentTypeSerializer(row).data,
                message="Content type created.",
                status_code=status.HTTP_201_CREATED,
            )
        except CertificateError as exc:
            return certificate_error_response(exc)


class ContentTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "content_type"

    def get(self, request, pk):
        try:
            row = ContentTypeService().get(pk)
            return APIResponse.success(data=ContentTypeSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ContentTypeUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = ContentTypeService().update(pk, serializer.validated_data)
            return APIResponse.success(data=ContentTypeSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def delete(self, request, pk):
        try:
            ContentTypeService().delete(pk)
            return APIResponse.success(message="Content type deleted.")
        except CertificateError as exc:
            return certificate_error_response(exc)


class UploadContentListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "upload_content"

    def get(self, request):
        qs = UploadContentService().list(query=request.query_params.get("q"))
        return _paginated(
            request, self, qs, UploadContentSerializer, "Upload content retrieved."
        )

    def post(self, request):
        serializer = UploadContentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        upload_by = getattr(request.user, "user_id", None)
        try:
            row = UploadContentService().create(
                serializer.validated_data, upload_by=int(upload_by or 0)
            )
            return APIResponse.success(
                data=UploadContentSerializer(row).data,
                message="Content uploaded.",
                status_code=status.HTTP_201_CREATED,
            )
        except CertificateError as exc:
            return certificate_error_response(exc)


class UploadContentDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "upload_content"

    def get(self, request, pk):
        try:
            row = UploadContentService().get(pk)
            return APIResponse.success(data=UploadContentSerializer(row).data)
        except CertificateError as exc:
            return certificate_error_response(exc)

    def delete(self, request, pk):
        try:
            UploadContentService().delete(pk)
            return APIResponse.success(message="Upload content deleted.")
        except CertificateError as exc:
            return certificate_error_response(exc)
