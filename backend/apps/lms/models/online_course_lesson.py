from django.db import models


class OnlineCourseLesson(models.Model):
    """Maps to `online_course_lesson` in db_current."""

    id = models.AutoField(primary_key=True)
    course_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    lesson_title = models.CharField(max_length=255, blank=True, null=True)
    lesson_type = models.CharField(max_length=20, blank=True, null=True)
    thumbnail = models.CharField(max_length=100, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    attachment = models.CharField(max_length=200, blank=True, null=True)
    video_provider = models.CharField(max_length=20, blank=True, null=True)
    video_url = models.TextField(blank=True, null=True)
    video_id = models.CharField(max_length=50, blank=True, null=True)
    duration = models.TimeField(blank=True, null=True)
    created_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_course_lesson"

    def __str__(self):
        return f"OnlineCourseLesson {self.pk}"
