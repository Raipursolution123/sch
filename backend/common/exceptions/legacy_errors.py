from rest_framework import status

from common.responses.api import APIResponse


def legacy_domain_error_response(
    exc: Exception,
    *,
    not_found_type: type[Exception],
    not_found_status: int = status.HTTP_404_NOT_FOUND,
    bad_request_status: int = status.HTTP_400_BAD_REQUEST,
):
    """Map domain exceptions to standardized API error responses."""
    if isinstance(exc, not_found_type):
        message = getattr(exc, "message", str(exc))
        return APIResponse.error(message=message, status_code=not_found_status)
    message = getattr(exc, "message", str(exc))
    return APIResponse.error(message=message, status_code=bad_request_status)
