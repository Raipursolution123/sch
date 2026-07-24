from django.urls import path

from apps.alumni.api.views.alumni import (
    AlumniEventsDetailView,
    AlumniEventsListCreateView,
    AlumniReportView,
    AlumniStudentsDetailView,
    AlumniStudentsListCreateView,
)

urlpatterns = [
    path("students/", AlumniStudentsListCreateView.as_view(), name="alumni_students"),
    path(
        "students/<int:pk>/",
        AlumniStudentsDetailView.as_view(),
        name="alumni_students_detail",
    ),
    path("events/", AlumniEventsListCreateView.as_view(), name="alumni_events"),
    path(
        "events/<int:pk>/",
        AlumniEventsDetailView.as_view(),
        name="alumni_events_detail",
    ),
    path("report/", AlumniReportView.as_view(), name="alumni_report"),
]
