from django.urls import include, path

urlpatterns = [
    # path("admin/", admin.site.urls),  # Disabled: django.contrib.admin removed (unmanaged User model)
    path("api/v1/", include("api.v1.urls")),
    path("health/", include("core.health.urls")),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
