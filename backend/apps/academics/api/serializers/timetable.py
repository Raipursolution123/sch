from rest_framework import serializers

from apps.academics.selectors.timetable_selectors import VALID_DAYS


class TimetableCreateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    subject_group_subject_id = serializers.IntegerField()
    staff_id = serializers.IntegerField()
    day = serializers.ChoiceField(choices=VALID_DAYS)
    start_time = serializers.CharField(max_length=20)
    end_time = serializers.CharField(max_length=20)
    room_no = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, max_length=20
    )


class TimetableUpdateSerializer(serializers.Serializer):
    subject_group_subject_id = serializers.IntegerField(required=False)
    staff_id = serializers.IntegerField(required=False)
    day = serializers.ChoiceField(choices=VALID_DAYS, required=False)
    start_time = serializers.CharField(required=False, max_length=20)
    end_time = serializers.CharField(required=False, max_length=20)
    room_no = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, max_length=20
    )
