from django.db import models


class OnlineCourseQuiz(models.Model):
    """Maps to `online_course_quiz` in db_current."""

    id = models.AutoField(primary_key=True)
    course_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    quiz_title = models.CharField(max_length=255, blank=True, null=True)
    quiz_instruction = models.TextField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True, db_index=True)
    created_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_course_quiz"

    def __str__(self):
        return f"OnlineCourseQuiz {self.pk}"
