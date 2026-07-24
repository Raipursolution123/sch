from rest_framework import status

from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse


def validation_error_response(errors) -> APIResponse:
    return APIResponse.error(
        message="Validation failed",
        data=errors,
        status_code=status.HTTP_400_BAD_REQUEST,
    )


def paginate_list_response(
    request,
    view,
    rows,
    *,
    list_message: str = "Records retrieved successfully.",
):
    """Paginate a list and return DRF-standard {count, next, previous, results}."""
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(rows, request, view=view)
    data = page if page is not None else rows
    if page is not None:
        return paginator.get_paginated_response(data)
    return APIResponse.success(data=data, message=list_message)
