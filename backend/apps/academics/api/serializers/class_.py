from rest_framework import serializers


class ClassCreateUpdateSerializer(serializers.Serializer):
    class_name = serializers.CharField(required=False, allow_blank=True, max_length=60)
    sort_order = serializers.IntegerField(required=False)
    is_hedu_program = serializers.BooleanField(required=False)
    is_active = serializers.CharField(required=False, allow_blank=True)
    sections = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True
    )
