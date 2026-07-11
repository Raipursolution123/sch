from rest_framework import serializers


class ClassSectionCreateSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    is_active = serializers.CharField(required=False, default="yes")


class ClassSectionUpdateSerializer(serializers.Serializer):
    is_active = serializers.CharField()


class ClassSectionBulkAssignSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    section_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )
