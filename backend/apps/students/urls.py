from django.urls import path

from apps.students.api.views.student import (
    StudentAcademicSessionsView,
    StudentDetailView,
    StudentDisableReasonListView,
    StudentEnableView,
    StudentListCreateView,
)
from apps.students.api.views.student_fee import StudentFeesView
from apps.students.api.views.student_masters import (
    StudentCategoryDetailView,
    StudentCategoryListCreateView,
    StudentHouseDetailView,
    StudentHouseListCreateView,
    StudentImportTemplateView,
    StudentImportView,
)
from apps.students.api.views.student_transport import StudentTransportView

urlpatterns = [
    path("", StudentListCreateView.as_view(), name="students-list"),
    path(
        "disable-reasons/",
        StudentDisableReasonListView.as_view(),
        name="student-disable-reasons",
    ),
    path(
        "categories/",
        StudentCategoryListCreateView.as_view(),
        name="student-categories-list-create",
    ),
    path(
        "categories/<int:pk>/",
        StudentCategoryDetailView.as_view(),
        name="student-categories-detail",
    ),
    path(
        "houses/",
        StudentHouseListCreateView.as_view(),
        name="student-houses-list-create",
    ),
    path(
        "houses/<int:pk>/",
        StudentHouseDetailView.as_view(),
        name="student-houses-detail",
    ),
    path(
        "import/template/",
        StudentImportTemplateView.as_view(),
        name="student-import-template",
    ),
    path(
        "import/",
        StudentImportView.as_view(),
        name="student-import",
    ),
    path("<int:pk>/enable/", StudentEnableView.as_view(), name="student-enable"),
    path("<int:pk>/", StudentDetailView.as_view(), name="student-detail"),
    path("<int:pk>/fees/", StudentFeesView.as_view(), name="student-fees"),
    path(
        "<int:pk>/transport/",
        StudentTransportView.as_view(),
        name="student-transport",
    ),
    path(
        "<int:student_id>/academic-sessions/",
        StudentAcademicSessionsView.as_view(),
        name="student-academic-sessions",
    ),
]
