from django.db import models


class CourseQuizAnswer(models.Model):
    """Maps to `course_quiz_answer` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    guest_id = models.IntegerField(blank=True, null=True)
    course_quiz_id = models.IntegerField(blank=True, null=True, db_index=True)
    course_quiz_question_id = models.IntegerField(blank=True, null=True, db_index=True)
    answer = models.CharField(max_length=255, blank=True, null=True)
    created_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "course_quiz_answer"

    def __str__(self):
        return f"CourseQuizAnswer {self.pk}"
