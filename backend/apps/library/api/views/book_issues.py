from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.library.api.serializers.book_issues import (
    BookIssueCreateSerializer,
    BookIssueSerializer,
    BookReturnSerializer,
    LibraryMemberCreateSerializer,
    LibraryMemberSerializer,
)
from apps.library.domain.library_exceptions import LibraryError, LibraryNotFoundError
from apps.library.services.book_issues_service import BookIssuesService
from apps.library.services.library_members_service import LibraryMembersService
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "library"
ISSUE_CATEGORY = "issue_return"


def library_error_response(exc: LibraryError):
    return legacy_domain_error_response(
        exc, not_found_type=LibraryNotFoundError
    )


class BookIssuesListCreateView(APIView):
    """List issues (GET) and issue a book (POST). Seed only grants can_view."""

    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = ISSUE_CATEGORY
    legacy_method_actions = {"GET": "can_view", "POST": "can_view"}

    def get(self, request):
        status_filter = request.query_params.get("status") or "open"
        query = request.query_params.get("q")
        try:
            rows = BookIssuesService().list_issues(
                status=status_filter, query=query
            )
        except LibraryError as exc:
            return library_error_response(exc)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(rows, request, view=self)
        data = BookIssueSerializer(
            page if page is not None else rows, many=True
        ).data
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Book issues retrieved successfully."
        )

    def post(self, request):
        serializer = BookIssueCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = BookIssuesService().issue_book(serializer.validated_data)
            return APIResponse.success(
                data=BookIssueSerializer(row).data,
                message="Book issued successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LibraryError as exc:
            return library_error_response(exc)


class BookIssueReturnView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = ISSUE_CATEGORY
    legacy_method_actions = {"POST": "can_view"}

    def post(self, request, pk):
        serializer = BookReturnSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            row = BookIssuesService().return_book(
                pk, return_date=serializer.validated_data.get("return_date")
            )
            return APIResponse.success(
                data=BookIssueSerializer(row).data,
                message="Book returned successfully.",
            )
        except LibraryError as exc:
            return library_error_response(exc)


class LibraryMembersListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = ISSUE_CATEGORY
    legacy_method_actions = {"GET": "can_view", "POST": "can_view"}

    def get(self, request):
        query = request.query_params.get("q")
        qs = LibraryMembersService().list_members(query=query)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        data = LibraryMemberSerializer(rows, many=True).data
        if page is not None:
            return paginator.get_paginated_response(data)
        return APIResponse.success(
            data=data, message="Library members retrieved successfully."
        )

    def post(self, request):
        serializer = LibraryMemberCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            member = LibraryMembersService().create_member(
                serializer.validated_data
            )
            return APIResponse.success(
                data=LibraryMemberSerializer(member).data,
                message="Library member created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LibraryError as exc:
            return library_error_response(exc)
