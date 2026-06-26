from django.db import models


class HomeworkEvaluation(models.Model):
    """Maps to `homework_evaluation` in db_current."""

    id = models.AutoField(primary_key=True)
    homework_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    marks = models.FloatField(blank=True, null=True)
    note = models.CharField(max_length=255)
    date = models.DateField()
    status = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "homework_evaluation"

    def __str__(self):
        return f"HomeworkEvaluation {self.pk}"
