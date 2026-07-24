from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.front_office.domain.front_office_exceptions import (
    FrontOfficeError,
    FrontOfficeNotFoundError,
)
from apps.front_office.services.phone_call_purpose_service import (
    PhoneCallLogService,
    VisitorsPurposeService,
)
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "front_office"


def front_office_error_response(exc: FrontOfficeError):
    if isinstance(exc, FrontOfficeNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


def _paginated(request, view, rows, message: str):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = page if page is not None else rows
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=message)


class PhoneCallLogListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "phone_call_log"

    def get(self, request):
        rows = PhoneCallLogService().list(query=request.query_params.get("q"))
        return _paginated(request, self, rows, "Phone call logs retrieved.")

    def post(self, request):
        try:
            data = PhoneCallLogService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Phone call log created.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class PhoneCallLogDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "phone_call_log"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=PhoneCallLogService().get(pk))
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=PhoneCallLogService().update(pk, request.data)
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            PhoneCallLogService().delete(pk)
            return APIResponse.success(message="Phone call log deleted.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class VisitorsPurposeListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "setup_font_office"

    def get(self, request):
        rows = VisitorsPurposeService().list()
        return _paginated(request, self, rows, "Visitor purposes retrieved.")

    def post(self, request):
        try:
            data = VisitorsPurposeService().create(request.data)
            return APIResponse.success(
                data=data,
                message="Visitor purpose created.",
                status_code=status.HTTP_201_CREATED,
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)


class VisitorsPurposeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "setup_font_office"

    def get(self, request, pk):
        try:
            return APIResponse.success(data=VisitorsPurposeService().get(pk))
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        try:
            return APIResponse.success(
                data=VisitorsPurposeService().update(pk, request.data)
            )
        except FrontOfficeError as exc:
            return front_office_error_response(exc)

    def delete(self, request, pk):
        try:
            VisitorsPurposeService().delete(pk)
            return APIResponse.success(message="Visitor purpose deleted.")
        except FrontOfficeError as exc:
            return front_office_error_response(exc)
