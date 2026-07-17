from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.filters import SearchFilter

from apps.academics.api.serializers.homework import (
    DailyAssignmentSerializer,
    HomeworkEvaluationSerializer,
    HomeworkSerializer,
    SubmitAssignmentSerializer,
)
from apps.academics.models.daily_assignment import DailyAssignment
from apps.academics.models.homework import Homework
from apps.academics.models.homework_evaluation import HomeworkEvaluation
from apps.academics.models.submit_assignment import SubmitAssignment


class HomeworkListCreateView(generics.ListCreateAPIView):
    queryset = Homework.objects.all().order_by("-homework_date")
    serializer_class = HomeworkSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = [
        "class_id",
        "section_id",
        "session_id",
        "staff_id",
        "subject_id",
    ]
    search_fields = ["description"]


class HomeworkDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer


class HomeworkEvaluationListCreateView(generics.ListCreateAPIView):
    queryset = HomeworkEvaluation.objects.all().order_by("-date")
    serializer_class = HomeworkEvaluationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["homework_id", "student_id", "status"]
    search_fields = ["note"]


class HomeworkEvaluationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HomeworkEvaluation.objects.all()
    serializer_class = HomeworkEvaluationSerializer


class DailyAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = DailyAssignment.objects.all().order_by("-date")
    serializer_class = DailyAssignmentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = [
        "student_session_id",
        "subject_group_subject_id",
        "evaluated_by",
    ]
    search_fields = ["title", "description", "remark"]


class DailyAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DailyAssignment.objects.all()
    serializer_class = DailyAssignmentSerializer


class SubmitAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = SubmitAssignment.objects.all().order_by("-created_at")
    serializer_class = SubmitAssignmentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["homework_id", "student_id"]
    search_fields = ["message", "file_name"]


class SubmitAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubmitAssignment.objects.all()
    serializer_class = SubmitAssignmentSerializer
