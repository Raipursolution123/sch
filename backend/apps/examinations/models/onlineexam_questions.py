from django.db import models


class OnlineexamQuestions(models.Model):
    """Maps to `onlineexam_questions` in db_current."""

    id = models.AutoField(primary_key=True)
    question_id = models.IntegerField(blank=True, null=True, db_index=True)
    onlineexam_id = models.IntegerField(blank=True, null=True, db_index=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    marks = models.FloatField(default=0.00)
    neg_marks = models.FloatField(blank=True, null=True, default=0.00)
    is_active = models.CharField(max_length=1, blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "onlineexam_questions"

    def __str__(self):
        return f"OnlineexamQuestions {self.pk}"
