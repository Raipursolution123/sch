from django.http import JsonResponse
from django.urls import path

from core.provisioning.checks import check_onboarding


def health_check(request):
    return JsonResponse({"status": "healthy", "service": "school-erp-backend"})


def readiness_check(request):
    status = check_onboarding()

    if not status.database_connected:
        return JsonResponse(
            {
                "status": "not_ready",
                "database": "error",
                "onboarding": status.as_dict(),
            },
            status=503,
        )

    payload = {
        "status": "ready" if status.ready_for_development else "not_ready",
        "database": "ok",
        "onboarding": status.as_dict(),
    }
    status_code = 200 if status.ready_for_development else 503
    return JsonResponse(payload, status=status_code)


urlpatterns = [
    path("", health_check, name="health"),
    path("ready/", readiness_check, name="readiness"),
]
