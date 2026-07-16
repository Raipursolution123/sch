from rest_framework import serializers

from apps.academics.models.daily_assignment import DailyAssignment
from apps.academics.models.homework import Homework
from apps.academics.models.homework_evaluation import HomeworkEvaluation
from apps.academics.models.submit_assignment import SubmitAssignment


class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = "__all__"


class HomeworkEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeworkEvaluation
        fields = "__all__"


class DailyAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyAssignment
        fields = "__all__"


class SubmitAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmitAssignment
        fields = "__all__"
