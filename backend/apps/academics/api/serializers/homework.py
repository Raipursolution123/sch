from rest_framework import serializers

from apps.academics.models.daily_assignment import DailyAssignment
from apps.academics.models.homework import Homework
from apps.academics.models.homework_evaluation import HomeworkEvaluation
from apps.academics.models.submit_assignment import SubmitAssignment


class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = [
            "id",
            "class_id",
            "section_id",
            "session_id",
            "staff_id",
            "subject_group_subject_id",
            "subject_id",
            "homework_date",
            "submit_date",
            "marks",
            "description",
            "assigned_to_house",
            "assigned_to_president",
            "create_date",
            "evaluation_date",
            "document",
            "created_by",
            "evaluated_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class HomeworkEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkEvaluation
        fields = [
            "id",
            "homework_id",
            "student_id",
            "student_session_id",
            "marks",
            "note",
            "date",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class DailyAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyAssignment
        fields = [
            "id",
            "student_session_id",
            "subject_group_subject_id",
            "title",
            "description",
            "attachment",
            "evaluated_by",
            "date",
            "evaluation_date",
            "remark",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SubmitAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmitAssignment
        fields = [
            "id",
            "homework_id",
            "student_id",
            "message",
            "docs",
            "file_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
