from rest_framework import serializers


class StudentBehaviourSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    point = serializers.IntegerField()
    description = serializers.CharField(allow_blank=True, required=False, default="")
    title = serializers.CharField(max_length=255)
    created_at = serializers.DateTimeField(read_only=True)


class StudentIncidentsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    session_id = serializers.IntegerField(read_only=True)
    student_id = serializers.IntegerField()
    incident_id = serializers.IntegerField()
    assign_by = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class StudentIncidentDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    session_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
    student_name = serializers.CharField(read_only=True)
    admission_no = serializers.CharField(read_only=True)
    class_name = serializers.CharField(read_only=True)
    section_name = serializers.CharField(read_only=True)
    incident_id = serializers.IntegerField()
    incident_title = serializers.CharField(read_only=True)
    incident_description = serializers.CharField(read_only=True)
    incident_point = serializers.IntegerField(read_only=True)
    assign_by_name = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class StudentIncidentCommentsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    student_incident_id = serializers.IntegerField()
    comment = serializers.CharField()
    type = serializers.CharField(max_length=50)  # "student" or "staff"
    staff_id = serializers.IntegerField(required=False, allow_null=True)
    student_id = serializers.IntegerField(required=False, allow_null=True)
    staff_name = serializers.CharField(read_only=True)
    student_name = serializers.CharField(read_only=True)
    created_date = serializers.DateTimeField(read_only=True)


class BehaviourSettingsSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    comment_option = serializers.CharField(max_length=100)
    created_at = serializers.DateTimeField(read_only=True)
