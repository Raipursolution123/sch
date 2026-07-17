from django.urls import path

from apps.admissions.api.views.online_admissions import (
    OnlineAdmissionConvertView,
    OnlineAdmissionDetailView,
    OnlineAdmissionListCreateView,
)

urlpatterns = [
    path(
        "online/",
        OnlineAdmissionListCreateView.as_view(),
        name="online-admissions-list-create",
    ),
    path(
        "online/<int:pk>/",
        OnlineAdmissionDetailView.as_view(),
        name="online-admissions-detail",
    ),
    path(
        "online/<int:pk>/convert/",
        OnlineAdmissionConvertView.as_view(),
        name="online-admissions-convert",
    ),
]
