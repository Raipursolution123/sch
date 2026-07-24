from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.alumni.services.alumni_service import (
    AlumniError,
    AlumniEventService,
    AlumniNotFoundError,
    AlumniStudentService,
    AlumniValidationError,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "alumni"


def alumni_error_response(exc: AlumniError):
    if isinstance(exc, AlumniNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, AlumniValidationError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


class AlumniStudentsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "manage_alumni"

    def get(self, request):
        service = AlumniStudentService()
        qs = service.list(query=request.query_params.get("q"))
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = [service.to_dict(r) for r in (page if page is not None else qs)]
        if page is not None:
            return paginator.get_paginated_response(rows)
        return APIResponse.success(data=rows, message="Alumni list retrieved.")

    def post(self, request):
        try:
            data = AlumniStudentService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Alumni created.",
                status_code=status.HTTP_201_CREATED,
            )
        except AlumniError as exc:
            return alumni_error_response(exc)


class AlumniStudentsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "manage_alumni"

    def get(self, request, pk):
        try:
            service = AlumniStudentService()
            return APIResponse.success(data=service.to_dict(service.get(pk)))
        except AlumniError as exc:
            return alumni_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = AlumniStudentService().update(pk, request.data)
            return APIResponse.success(data=data, message="Alumni updated.")
        except AlumniError as exc:
            return alumni_error_response(exc)

    def delete(self, request, pk):
        try:
            AlumniStudentService().delete(pk)
            return APIResponse.success(message="Alumni deleted.")
        except AlumniError as exc:
            return alumni_error_response(exc)


class AlumniEventsListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "events"

    def get(self, request):
        service = AlumniEventService()
        qs = service.list(query=request.query_params.get("q"))
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = [service.to_dict(r) for r in (page if page is not None else qs)]
        if page is not None:
            return paginator.get_paginated_response(rows)
        return APIResponse.success(data=rows, message="Alumni events retrieved.")

    def post(self, request):
        try:
            data = AlumniEventService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Alumni event created.",
                status_code=status.HTTP_201_CREATED,
            )
        except AlumniError as exc:
            return alumni_error_response(exc)


class AlumniEventsDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "events"

    def get(self, request, pk):
        try:
            service = AlumniEventService()
            return APIResponse.success(data=service.to_dict(service.get(pk)))
        except AlumniError as exc:
            return alumni_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            data = AlumniEventService().update(pk, request.data)
            return APIResponse.success(data=data, message="Alumni event updated.")
        except AlumniError as exc:
            return alumni_error_response(exc)

    def delete(self, request, pk):
        try:
            AlumniEventService().delete(pk)
            return APIResponse.success(message="Alumni event deleted.")
        except AlumniError as exc:
            return alumni_error_response(exc)


class AlumniReportView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = "reports"
    legacy_permission_category = "alumni_report"

    def get(self, request):
        service = AlumniStudentService()
        qs = service.list(query=request.query_params.get("q"))
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = [service.to_dict(r) for r in (page if page is not None else qs)]
        if page is not None:
            return paginator.get_paginated_response(rows)
        return APIResponse.success(data=rows, message="Alumni report retrieved.")
