from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.settings.api.serializers.setup_front_office import (
    ReferenceSerializer,
    SourceSerializer,
)
from apps.settings.domain.settings_exceptions import (
    SettingsError,
    SettingsNotFoundError,
)
from apps.settings.services.setup_front_office_service import (
    ReferenceService,
    SourceService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"
CATEGORY = "setup_font_office"  # Matches basic_seed.sql setup category


def settings_error_response(exc: SettingsError):
    if isinstance(exc, SettingsNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


class SourceListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = SourceService()
        qs = service.list_sources()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = SourceSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Sources retrieved successfully."
        )

    def post(self, request):
        serializer = SourceSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            item = SourceService().create_source(serializer.validated_data)
            response_serializer = SourceSerializer(item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Source created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class SourceDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            item = SourceService().get_source(pk)
            serializer = SourceSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="Source retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = SourceSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            item = SourceService().update_source(pk, serializer.validated_data)
            response_serializer = SourceSerializer(item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Source updated successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            SourceService().delete_source(pk)
            return APIResponse.success(message="Source deleted successfully.")
        except SettingsError as exc:
            return settings_error_response(exc)


class ReferenceListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        service = ReferenceService()
        qs = service.list_references()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = ReferenceSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="References retrieved successfully."
        )

    def post(self, request):
        serializer = ReferenceSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            item = ReferenceService().create_reference(serializer.validated_data)
            response_serializer = ReferenceSerializer(item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Reference created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SettingsError as exc:
            return settings_error_response(exc)


class ReferenceDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            item = ReferenceService().get_reference(pk)
            serializer = ReferenceSerializer(item)
            return APIResponse.success(
                data=serializer.data,
                message="Reference retrieved successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ReferenceSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            item = ReferenceService().update_reference(pk, serializer.validated_data)
            response_serializer = ReferenceSerializer(item)
            return APIResponse.success(
                data=response_serializer.data,
                message="Reference updated successfully.",
            )
        except SettingsError as exc:
            return settings_error_response(exc)

    def delete(self, request, pk):
        try:
            ReferenceService().delete_reference(pk)
            return APIResponse.success(message="Reference deleted successfully.")
        except SettingsError as exc:
            return settings_error_response(exc)
