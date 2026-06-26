from django.db import models


class LessonPlanForum(models.Model):
    """Maps to `lesson_plan_forum` in db_current."""

    id = models.AutoField(primary_key=True)
    subject_syllabus_id = models.IntegerField(blank=False, null=False, db_index=True)
    type = models.CharField(max_length=20)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    message = models.TextField()
    created_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "lesson_plan_forum"

    def __str__(self):
        return f"LessonPlanForum {self.pk}"
