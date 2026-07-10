from rest_framework import serializers


class PromoteExecuteSerializer(serializers.Serializer):
    from_session_id = serializers.IntegerField()
    from_class_id = serializers.IntegerField()
    from_section_id = serializers.IntegerField()
    to_session_id = serializers.IntegerField()
    to_class_id = serializers.IntegerField()
    to_section_id = serializers.IntegerField()
    to_subject_group_id = serializers.IntegerField(required=False, allow_null=True)
    student_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
    deactivate_source = serializers.BooleanField(required=False, default=True)
    mark_alumni = serializers.BooleanField(required=False, default=False)
