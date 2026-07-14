from django.urls import path

from apps.examinations.api.views.exam import ExamsDetailView, ExamsListCreateView
from apps.examinations.api.views.exam_groups import (
    ExamGroupsDetailView,
    ExamGroupsListCreateView,
)
from apps.examinations.api.views.exam_schedules import (
    ExamSchedulesDetailView,
    ExamSchedulesListCreateView,
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
]
