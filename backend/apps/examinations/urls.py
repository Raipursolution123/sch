from django.urls import path

from apps.examinations.api.views.cbse_exam import CbseExamsListCreateView
from apps.examinations.api.views.exam import ExamsDetailView, ExamsListCreateView
from apps.examinations.api.views.exam_enrollment import (
    ExamEnrollmentAssignView,
    ExamEnrollmentRosterView,
    ExamEnrollmentUnassignView,
)
from apps.examinations.api.views.exam_groups import (
    ExamGroupsDetailView,
    ExamGroupsListCreateView,
)
from apps.examinations.api.views.exam_results import (
    ExamResultRosterView,
    ExamResultsSaveView,
)
from apps.examinations.api.views.exam_schedules import (
    ExamSchedulesDetailView,
    ExamSchedulesListCreateView,
)
from apps.examinations.api.views.grades import GradesDetailView, GradesListCreateView
from apps.examinations.api.views.mark_divisions import (
    MarkDivisionsDetailView,
    MarkDivisionsListCreateView,
)

app_name = "examinations"

urlpatterns = [
    path("groups/", ExamGroupsListCreateView.as_view(), name="exam_groups_list_create"),
    path("groups/<int:pk>/", ExamGroupsDetailView.as_view(), name="exam_groups_detail"),
    path("exams/", ExamsListCreateView.as_view(), name="exams_list_create"),
    path("exams/<int:pk>/", ExamsDetailView.as_view(), name="exams_detail"),
    path(
        "schedules/",
        ExamSchedulesListCreateView.as_view(),
        name="exam_schedules_list_create",
    ),
    path(
        "schedules/<int:pk>/",
        ExamSchedulesDetailView.as_view(),
        name="exam_schedules_detail",
    ),
    path("grades/", GradesListCreateView.as_view(), name="grades_list_create"),
    path("grades/<int:pk>/", GradesDetailView.as_view(), name="grades_detail"),
    path(
        "divisions/",
        MarkDivisionsListCreateView.as_view(),
        name="mark_divisions_list_create",
    ),
    path(
        "divisions/<int:pk>/",
        MarkDivisionsDetailView.as_view(),
        name="mark_divisions_detail",
    ),
    path(
        "results/roster/",
        ExamResultRosterView.as_view(),
        name="exam_results_roster",
    ),
    path("results/", ExamResultsSaveView.as_view(), name="exam_results_save"),
    path(
        "enrollments/roster/",
        ExamEnrollmentRosterView.as_view(),
        name="exam_enrollments_roster",
    ),
    path(
        "enrollments/",
        ExamEnrollmentAssignView.as_view(),
        name="exam_enrollments_assign",
    ),
    path(
        "enrollments/<int:pk>/",
        ExamEnrollmentUnassignView.as_view(),
        name="exam_enrollments_unassign",
    ),
    path(
        "cbse-exams/",
        CbseExamsListCreateView.as_view(),
        name="cbse_exams_list_create",
    ),
]
