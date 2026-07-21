from django.urls import path

from apps.students.api.views.student import (
    StudentAcademicSessionsView,
    StudentDetailView,
    StudentDisableReasonListView,
    StudentEnableView,
    StudentListCreateView,
)
from apps.students.api.views.student_fee import StudentFeesView
from apps.students.api.views.student_transport import StudentTransportView

from apps.students.api.views.categories_houses import (
    StudentCategoriesListView,
    StudentCategoryDetailView,
    StudentHousesListView,
    StudentHouseDetailView,
    StudentImportView,
)

urlpatterns = [
    path("", StudentListCreateView.as_view(), name="students-list"),
    path("categories/", StudentCategoriesListView.as_view(), name="student-categories"),
    path("categories/<int:pk>/", StudentCategoryDetailView.as_view(), name="student-category-detail"),
    path("houses/", StudentHousesListView.as_view(), name="student-houses"),
    path("houses/<int:pk>/", StudentHouseDetailView.as_view(), name="student-house-detail"),
    path("import/", StudentImportView.as_view(), name="student-import"),
    path(
        "disable-reasons/",
        StudentDisableReasonListView.as_view(),
        name="student-disable-reasons",
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
