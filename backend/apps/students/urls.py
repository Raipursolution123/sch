from django.urls import path

from apps.students.api.views.student import (
    StudentAcademicSessionsView,
    StudentDetailView,
    StudentDisableReasonListView,
    StudentEnableView,
    StudentListCreateView,
)
from apps.students.api.views.student_fee import StudentFeesView

urlpatterns = [
    path("", StudentListCreateView.as_view(), name="students-list"),
    path(
        "disable-reasons/",
        StudentDisableReasonListView.as_view(),
        name="student-disable-reasons",
    ),
    path("<int:pk>/enable/", StudentEnableView.as_view(), name="student-enable"),
    path("<int:pk>/", StudentDetailView.as_view(), name="student-detail"),
    path("<int:pk>/fees/", StudentFeesView.as_view(), name="student-fees"),
    path(
        "<int:student_id>/academic-sessions/",
        StudentAcademicSessionsView.as_view(),
        name="student-academic-sessions",
    ),
]
