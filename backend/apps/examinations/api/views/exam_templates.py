from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.examinations.api.views.common import MODULE, examination_error_response
from apps.examinations.domain.examination_exceptions import ExaminationError
from apps.examinations.services.exam_template_service import (
    AdmitCardTemplateService,
    MarksheetTemplateService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege


def _paginated(request, view, rows, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = page if page is not None else rows
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class AdmitCardTemplateListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_admit_card"

    def get(self, request):
        rows = AdmitCardTemplateService().list()
        return _paginated(request, self, rows, "Admit card templates retrieved.")

    def post(self, request):
        try:
            data = AdmitCardTemplateService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Admit card template created.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class AdmitCardTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_admit_card"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=AdmitCardTemplateService().get(pk))
        except ExaminationError as exc:
            return examination_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=AdmitCardTemplateService().update(pk, request.data)
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def delete(self, request, pk):
        try:
            AdmitCardTemplateService().delete(pk)
            return APIResponse.success(message="Admit card template deleted.")
        except ExaminationError as exc:
            return examination_error_response(exc)


class MarksheetTemplateListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_marksheet"

    def get(self, request):
        rows = MarksheetTemplateService().list()
        return _paginated(request, self, rows, "Marksheet templates retrieved.")

    def post(self, request):
        try:
            data = MarksheetTemplateService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Marksheet template created.",
                status_code=status.HTTP_201_CREATED,
            )
        except ExaminationError as exc:
            return examination_error_response(exc)


class MarksheetTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "design_marksheet"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=MarksheetTemplateService().get(pk))
        except ExaminationError as exc:
            return examination_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=MarksheetTemplateService().update(pk, request.data)
            )
        except ExaminationError as exc:
            return examination_error_response(exc)

    def delete(self, request, pk):
        try:
            MarksheetTemplateService().delete(pk)
            return APIResponse.success(message="Marksheet template deleted.")
        except ExaminationError as exc:
            return examination_error_response(exc)
