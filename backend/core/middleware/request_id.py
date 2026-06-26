import uuid

from django.utils.deprecation import MiddlewareMixin


class RequestIDMiddleware(MiddlewareMixin):
    """Attach a unique request ID to each request for tracing."""

    HEADER_NAME = "HTTP_X_REQUEST_ID"

    def process_request(self, request):
        request_id = request.META.get(self.HEADER_NAME)
        if not request_id:
            request_id = str(uuid.uuid4())
        request.request_id = request_id

    def process_response(self, request, response):
        if hasattr(request, "request_id"):
            response["X-Request-ID"] = request.request_id
        return response
