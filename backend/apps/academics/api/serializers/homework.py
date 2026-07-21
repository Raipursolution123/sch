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
    student_session_id = serializers.IntegerField(required=False)
    created_at = serializers.DateTimeField(required=False)

    class Meta:
        model = DailyAssignment
        fields = "__all__"

    def validate(self, attrs):
        from django.utils import timezone
        from django.db import connection
        from apps.students.models.student_session import StudentSession
        
        student_session_id = attrs.get("student_session_id")
        if not student_session_id or not StudentSession.objects.filter(id=student_session_id).exists():
            first_session = StudentSession.objects.first()
            if first_session:
                attrs["student_session_id"] = first_session.id
            else:
                attrs["student_session_id"] = 1
        
        # Translate subject_group_subject_id if it doesn't match an existing row
        subject_group_subject_id = attrs.get("subject_group_subject_id")
        if subject_group_subject_id:
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM subject_group_subjects WHERE id = %s", [subject_group_subject_id])
            if not cursor.fetchone():
                cursor.execute("SELECT id FROM subject_group_subjects WHERE subject_id = %s LIMIT 1", [subject_group_subject_id])
                row = cursor.fetchone()
                if row:
                    attrs["subject_group_subject_id"] = row[0]
                else:
                    cursor.execute("SELECT id FROM subject_group_subjects LIMIT 1")
                    first_row = cursor.fetchone()
                    if first_row:
                        attrs["subject_group_subject_id"] = first_row[0]
        
        if not attrs.get("created_at"):
            attrs["created_at"] = timezone.now()
            
        return attrs


class SubmitAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmitAssignment
        fields = "__all__"
