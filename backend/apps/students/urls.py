from django.urls import path

from apps.students.api.views.student import (
    StudentDetailView,
    StudentDisableReasonListView,
    StudentListCreateView,
)
from apps.students.api.views.student_fee import StudentFeesView
from apps.students.views import ParentsTestView, StudentAcademicSessionsView

urlpatterns = [
    path("test-parents/", ParentsTestView.as_view(), name="test-parents"),
    path("", StudentListCreateView.as_view(), name="students-list"),
    path("disable-reasons/", StudentDisableReasonListView.as_view(), name="student-disable-reasons"),
    path("<int:pk>/", StudentDetailView.as_view(), name="student-detail"),
    path("<int:pk>/fees/", StudentFeesView.as_view(), name="student-fees"),
    path(
        "<int:student_id>/academic-sessions/",
        StudentAcademicSessionsView.as_view(),
        name="student-academic-sessions",
    ),
]
