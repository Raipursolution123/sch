from django.db import models


class DailyAssignment(models.Model):
    """Maps to `daily_assignment` in db_current."""

    id = models.AutoField(primary_key=True)
    student_session_id = models.IntegerField(blank=False, null=False, db_index=True)
    subject_group_subject_id = models.IntegerField(blank=False, null=False, db_index=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    attachment = models.CharField(max_length=255, blank=True, null=True)
    evaluated_by = models.IntegerField(blank=True, null=True, db_index=True)
    date = models.DateField(blank=True, null=True)
    evaluation_date = models.DateField(blank=True, null=True)
    remark = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "daily_assignment"

    def __str__(self):
        return f"DailyAssignment {self.pk}"
