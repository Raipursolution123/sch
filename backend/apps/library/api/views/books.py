from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.library.api.serializers.books import (
    BookCreateSerializer,
    BookSerializer,
    BookUpdateSerializer,
)
from apps.library.domain.library_exceptions import LibraryError, LibraryNotFoundError
from apps.library.services.books_service import BooksService
from common.exceptions.legacy_errors import legacy_domain_error_response
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "library"
CATEGORY = "books"


def library_error_response(exc: LibraryError):
    return legacy_domain_error_response(
        exc, not_found_type=LibraryNotFoundError
    )


class BooksListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        query = request.query_params.get("q")
        qs = BooksService().list_books(query=query)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = BookSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Books retrieved successfully."
        )

    def post(self, request):
        serializer = BookCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            book = BooksService().create_book(serializer.validated_data)
            return APIResponse.success(
                data=BookSerializer(book).data,
                message="Book created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except LibraryError as exc:
            return library_error_response(exc)


class BooksDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request, pk):
        try:
            book = BooksService().get_book(pk)
            return APIResponse.success(
                data=BookSerializer(book).data,
                message="Book retrieved successfully.",
            )
        except LibraryError as exc:
            return library_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = BookUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            book = BooksService().update_book(pk, serializer.validated_data)
            return APIResponse.success(
                data=BookSerializer(book).data,
                message="Book updated successfully.",
            )
        except LibraryError as exc:
            return library_error_response(exc)

    def delete(self, request, pk):
        try:
            BooksService().delete_book(pk)
            return APIResponse.success(message="Book deleted successfully.")
        except LibraryError as exc:
            return library_error_response(exc)
