from django.http import JsonResponse
from django.urls import path


def health_check(request):
    return JsonResponse({"status": "healthy", "service": "school-erp-backend"})


def readiness_check(request):
    from django.db import connection

    try:
        connection.ensure_connection()
        db_status = "ok"
    except Exception:
        db_status = "error"

    status_code = 200 if db_status == "ok" else 503
    return JsonResponse(
        {"status": "ready" if db_status == "ok" else "not_ready", "database": db_status},
        status=status_code,
    )


urlpatterns = [
    path("", health_check, name="health"),
    path("ready/", readiness_check, name="readiness"),
]
