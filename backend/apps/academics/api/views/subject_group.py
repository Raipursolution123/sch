import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.subject_group import (
    SubjectGroupCreateSerializer,
    SubjectGroupSyncClassSectionsSerializer,
    SubjectGroupSyncSubjectsSerializer,
    SubjectGroupUpdateSerializer,
)
from apps.academics.domain.subject_group_exceptions import (
    SubjectGroupError,
    SubjectGroupInUseError,
    SubjectGroupNotFoundError,
    SubjectGroupValidationError,
)
from apps.academics.selectors.subject_group_selectors import group_list_item_dict
from apps.academics.services.subject_group_service import SubjectGroupService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

logger = logging.getLogger(__name__)

MODULE = "academics"
CATEGORY = "subject_group"


def _parse_session_id(request) -> int | None:
    raw = request.query_params.get("session_id")
    if raw in (None, ""):
        return None
    try:
        return int(raw)
    except ValueError:
        return None


class SubjectGroupListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        session_id = _parse_session_id(request)
        qs = SubjectGroupService().list_groups(session_id=session_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = [group_list_item_dict(g) for g in rows]
        if page is not None:
            return paginator.get_paginated_response({"subject_groups": data})
        return APIResponse.success(
            data={"subject_groups": data},
            message="Subject groups retrieved successfully.",
        )

    def post(self, request):
        serializer = SubjectGroupCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = SubjectGroupService().create_group(payload)
            return APIResponse.success(
                data=data,
                message=f"Subject group '{data['name']}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SubjectGroupError as exc:
            return _error_response(exc)


class SubjectGroupDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=SubjectGroupService().get_group(pk),
                message="Subject group details retrieved successfully.",
            )
        except SubjectGroupError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = SubjectGroupUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = SubjectGroupService().update_group(pk, payload)
            return APIResponse.success(
                data=data, message="Subject group updated successfully."
            )
        except SubjectGroupError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                SubjectGroupService().delete_group(pk)
            return APIResponse.success(message="Subject group deleted successfully.")
        except SubjectGroupError as exc:
            return _error_response(exc)


class SubjectGroupSyncSubjectsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_permission_action = "can_edit"

    def put(self, request, pk):
        serializer = SubjectGroupSyncSubjectsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                data = SubjectGroupService().sync_subjects(
                    pk, serializer.validated_data["subject_ids"]
                )
            return APIResponse.success(
                data=data, message="Subjects assigned successfully."
            )
        except SubjectGroupError as exc:
            return _error_response(exc)


class SubjectGroupSyncClassSectionsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_permission_action = "can_edit"

    def put(self, request, pk):
        serializer = SubjectGroupSyncClassSectionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                data = SubjectGroupService().sync_class_sections(
                    pk, serializer.validated_data["class_section_ids"]
                )
            return APIResponse.success(
                data=data, message="Class sections assigned successfully."
            )
        except SubjectGroupError as exc:
            return _error_response(exc)


def _error_response(exc: SubjectGroupError) -> Response:
    if isinstance(exc, SubjectGroupNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (SubjectGroupValidationError, SubjectGroupInUseError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected subject group error: %s", exc)
    return APIResponse.error(
        message="Subject group operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
