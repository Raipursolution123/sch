from rest_framework import serializers


class ClassTeacherCreateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    staff_id = serializers.IntegerField()


class ClassTeacherUpdateSerializer(serializers.Serializer):
    staff_id = serializers.IntegerField()
