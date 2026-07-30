from rest_framework import serializers
from apps.lms.models.online_courses import OnlineCourses

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineCourses
        fields = (
            "id",
            "title",
            "slug",
            "url",
            "description",
            "price",
            "discount",
            "free_course",
            "front_side_visibility",
            "status",
            "created_date",
            "updated_date",
        )
        read_only_fields = ("id", "created_date", "updated_date", "slug", "url")
