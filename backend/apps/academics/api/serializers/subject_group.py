from rest_framework import serializers


class SubjectGroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=250)
    session_id = serializers.IntegerField()
    description = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )


class SubjectGroupUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True, max_length=250)
    description = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )


class SubjectGroupSyncSubjectsSerializer(serializers.Serializer):
    subject_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )


class SubjectGroupSyncClassSectionsSerializer(serializers.Serializer):
    class_section_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )
