from django.db import models


class CourseProgress(models.Model):
    """Maps to `course_progress` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    guest_id = models.IntegerField(blank=True, null=True)
    course_id = models.IntegerField(blank=True, null=True, db_index=True)
    course_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    lesson_quiz_id = models.IntegerField(blank=True, null=True)
    lesson_quiz_type = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "course_progress"

    def __str__(self):
        return f"CourseProgress {self.pk}"
