from rest_framework import status

from apps.transport.domain.transport_exceptions import TransportNotFoundError
from common.exceptions.legacy_errors import legacy_domain_error_response


def test_legacy_domain_error_response_not_found():
    class SampleNotFound(Exception):
        message = "Missing"

    exc = SampleNotFound()
    response = legacy_domain_error_response(exc, not_found_type=SampleNotFound)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.data["error"]["message"] == "Missing"


def test_legacy_domain_error_response_bad_request():
    class SampleError(Exception):
        message = "Invalid"

    exc = SampleError()
    response = legacy_domain_error_response(exc, not_found_type=TransportNotFoundError)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data["error"]["message"] == "Invalid"
