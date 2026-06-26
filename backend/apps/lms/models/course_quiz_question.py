from django.db import models


class CourseQuizQuestion(models.Model):
    """Maps to `course_quiz_question` in db_current."""

    id = models.AutoField(primary_key=True)
    course_quiz_id = models.IntegerField(blank=True, null=True, db_index=True)
    question = models.TextField(blank=True, null=True)
    option_1 = models.CharField(max_length=255, blank=True, null=True)
    option_2 = models.CharField(max_length=255, blank=True, null=True)
    option_3 = models.CharField(max_length=255, blank=True, null=True)
    option_4 = models.CharField(max_length=255, blank=True, null=True)
    option_5 = models.CharField(max_length=255, blank=True, null=True)
    correct_answer = models.CharField(max_length=255, blank=True, null=True)
    created_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "course_quiz_question"

    def __str__(self):
        return f"CourseQuizQuestion {self.pk}"
