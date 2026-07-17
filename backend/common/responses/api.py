from rest_framework.response import Response


class APIResponse:
    """Standardized API response wrapper."""

    @staticmethod
    def success(data=None, message="Success", status_code=200):
        return Response(
            {"success": True, "message": message, "data": data},
            status=status_code,
        )

    @staticmethod
    def error(message="Error", details=None, data=None, status_code=400):
        return Response(
            {
                "success": False,
                "error": {"message": message, "details": details or data},
            },
            status=status_code,
        )
