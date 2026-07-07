from django.urls import path
from apps.examinations.views import (
    ExamGroupsListCreateView, 
    ExamGroupsDetailView,
    ExamsListCreateView,
    ExamsDetailView
)

app_name = "examinations"

urlpatterns = [
    path("groups/", ExamGroupsListCreateView.as_view(), name="exam_groups_list_create"),
    path("groups/<int:pk>/", ExamGroupsDetailView.as_view(), name="exam_groups_detail"),
    path("exams/", ExamsListCreateView.as_view(), name="exams_list_create"),
    path("exams/<int:pk>/", ExamsDetailView.as_view(), name="exams_detail"),
]
