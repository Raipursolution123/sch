from django.db import models


class StudentQuizStatus(models.Model):
    """Maps to `student_quiz_status` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    guest_id = models.TextField(blank=True, null=True)
    course_quiz_id = models.IntegerField(blank=True, null=True, db_index=True)
    total_question = models.IntegerField(blank=True, null=True)
    correct_answer = models.IntegerField(blank=True, null=True)
    wrong_answer = models.IntegerField(blank=True, null=True)
    not_answer = models.IntegerField(blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    created_date = models.DateTimeField(blank=True, null=True)
    updated_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "student_quiz_status"

    def __str__(self):
        return f"StudentQuizStatus {self.pk}"
