from django.db import models


class CourseLessonQuizOrder(models.Model):
    """Maps to `course_lesson_quiz_order` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=10, blank=True, null=True)
    course_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    lesson_quiz_id = models.IntegerField(blank=True, null=True)
    order = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "course_lesson_quiz_order"

    def __str__(self):
        return f"CourseLessonQuizOrder {self.pk}"
