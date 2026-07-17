from django.urls import path

from apps.communications.api.views.notices import (
    NoticesDetailView,
    NoticesListCreateView,
)

app_name = "communications"

urlpatterns = [
    path("notices/", NoticesListCreateView.as_view(), name="notices_list_create"),
    path("notices/<int:pk>/", NoticesDetailView.as_view(), name="notices_detail"),
]
