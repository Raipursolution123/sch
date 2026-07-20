from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.academics.api.serializers.class_section import (
    ClassSectionBulkAssignSerializer,
    ClassSectionCreateSerializer,
    ClassSectionUpdateSerializer,
)
from apps.academics.api.views.section import _error_response
from apps.academics.domain.academic_structure_exceptions import AcademicStructureError
from apps.academics.models import Classes, Sections
from apps.academics.selectors.class_section_selectors import mapping_to_dict
from apps.academics.services.class_section_service import ClassSectionService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "academics"
CATEGORY = "class"


class ClassSectionListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = ClassSectionService().list_mappings(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)

        class_ids = [m.class_id for m in rows if m.class_id]
        section_ids = [m.section_id for m in rows if m.section_id]
        classes_dict = {
            c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)
        }
        sections_dict = {
            s.id: s.section for s in Sections.objects.filter(id__in=section_ids)
        }
        data = [
            mapping_to_dict(
                m,
                class_name=classes_dict.get(m.class_id),
                section_name=sections_dict.get(m.section_id),
            )
            for m in rows
        ]
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data={"class_sections": data},
            message="Class-Section mappings retrieved successfully.",
        )

    def post(self, request):
        serializer = ClassSectionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = ClassSectionService().create_mapping(payload)
            return APIResponse.success(
                data=data,
                message="Mapping created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except AcademicStructureError as exc:
            return _error_response(exc)


class ClassSectionDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=ClassSectionService().get_mapping(pk),
                message="Mapping details retrieved successfully.",
            )
        except AcademicStructureError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ClassSectionUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            data = ClassSectionService().update_mapping(pk, serializer.validated_data)
            return APIResponse.success(
                data=data, message="Mapping updated successfully."
            )
        except AcademicStructureError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                ClassSectionService().deactivate_mapping(pk)
            return APIResponse.success(
                message="Class-Section mapping successfully deactivated."
            )
        except AcademicStructureError as exc:
            return _error_response(exc)


class ClassSectionBulkAssignView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY
    legacy_permission_action = "can_edit"

    def post(self, request):
        serializer = ClassSectionBulkAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                ClassSectionService().bulk_assign(
                    serializer.validated_data["class_id"],
                    serializer.validated_data["section_ids"],
                )
            return APIResponse.success(
                message="Sections successfully assigned/updated for class."
            )
        except AcademicStructureError as exc:
            return _error_response(exc)


class ClassAssignedSectionsView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, class_id):
        try:
            sections = ClassSectionService().list_assigned_sections(class_id)
            return APIResponse.success(
                data={"sections": sections},
                message="Assigned sections retrieved successfully.",
            )
        except AcademicStructureError as exc:
            return _error_response(exc)
