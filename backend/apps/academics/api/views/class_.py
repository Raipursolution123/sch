from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.academics.api.serializers.class_ import ClassCreateUpdateSerializer
from apps.academics.api.views.section import _error_response
from apps.academics.domain.academic_structure_exceptions import AcademicStructureError
from apps.academics.selectors.class_selectors import (
    active_sections_for_classes,
    class_to_dict,
)
from apps.academics.services.class_service import ClassService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "academics"
CATEGORY = "class"


class ClassListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = ClassService().list_classes(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        sections_map = active_sections_for_classes([c.id for c in rows])
        data = [class_to_dict(c, sections_map.get(c.id, [])) for c in rows]
        if page is not None:
            return paginator.get_paginated_response({"classes": data})
        return APIResponse.success(
            data={"classes": data}, message="Classes retrieved successfully."
        )

    def post(self, request):
        serializer = ClassCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            with transaction.atomic():
                data = ClassService().create_class(payload)
            return APIResponse.success(
                data=data,
                message=f"Class '{data['class_name']}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except AcademicStructureError as exc:
            return _error_response(exc)


class ClassDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=ClassService().get_class(pk),
                message="Class details retrieved successfully.",
            )
        except AcademicStructureError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = ClassCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            with transaction.atomic():
                data = ClassService().update_class(pk, payload)
            return APIResponse.success(data=data, message="Class updated successfully.")
        except AcademicStructureError as exc:
            return _error_response(exc)

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                ClassService().deactivate_class(pk)
            return APIResponse.success(message="Class successfully deactivated.")
        except AcademicStructureError as exc:
            return _error_response(exc)
