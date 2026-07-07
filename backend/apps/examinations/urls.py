from django.urls import path
from apps.examinations.views import ExamGroupsListCreateView, ExamGroupsDetailView

app_name = "examinations"

urlpatterns = [
    path("groups/", ExamGroupsListCreateView.as_view(), name="exam_groups_list_create"),
    path("groups/<int:pk>/", ExamGroupsDetailView.as_view(), name="exam_groups_detail"),
]
