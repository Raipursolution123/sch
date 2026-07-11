import logging

from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academics.api.serializers.subject import SubjectCreateUpdateSerializer
from apps.academics.domain.subject_exceptions import (
    SubjectError,
    SubjectInUseError,
    SubjectNotFoundError,
    SubjectValidationError,
)
from apps.academics.selectors.subject_selectors import subject_to_dict
from apps.academics.services.subject_service import SubjectService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)

MODULE = "academics"
CATEGORY = "subject"


class SubjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        active_only = request.query_params.get("active_only", "false").lower() == "true"
        qs = SubjectService().list_subjects(active_only=active_only)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = page if page is not None else qs
        data = [subject_to_dict(s) for s in rows]
        if page is not None:
            return paginator.get_paginated_response({"subjects": data})
        return APIResponse.success(
            data={"subjects": data}, message="Subjects retrieved successfully."
        )

    def post(self, request):
        serializer = SubjectCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = SubjectService().create_subject(payload)
            return APIResponse.success(
                data=data,
                message=f"Subject '{data['name']}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except SubjectError as exc:
            return _error_response(exc)
        except Exception as exc:
            return APIResponse.error(
                message=f"Detailed Error: {type(exc).__name__}: {str(exc)}",
                status_code=500
            )


class SubjectDetailView(APIView):
    permission_classes = [IsAuthenticated]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            return APIResponse.success(
                data=SubjectService().get_subject(pk),
                message="Subject details retrieved successfully.",
            )
        except SubjectError as exc:
            return _error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = SubjectCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = {k: request.data.get(k) for k in request.data.keys()}
        try:
            data = SubjectService().update_subject(pk, payload)
            return APIResponse.success(
                data=data, message="Subject updated successfully."
            )
        except SubjectError as exc:
            return _error_response(exc)
        except Exception as exc:
            return APIResponse.error(
                message=f"Detailed Error: {type(exc).__name__}: {str(exc)}",
                status_code=500
            )

    def delete(self, request, pk):
        try:
            with transaction.atomic():
                SubjectService().deactivate_subject(pk)
            return APIResponse.success(message="Subject successfully deactivated.")
        except SubjectError as exc:
            return _error_response(exc)


def _error_response(exc: SubjectError) -> Response:
    if isinstance(exc, SubjectNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    if isinstance(exc, (SubjectValidationError, SubjectInUseError)):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
        )
    logger.exception("Unexpected subject error: %s", exc)
    return APIResponse.error(
        message="Subject operation failed.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
