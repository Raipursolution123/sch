from django.db import models


class ConferencesHistory(models.Model):
    """Maps to `conferences_history` in db_current."""

    id = models.AutoField(primary_key=True)
    conference_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    total_hit = models.IntegerField(default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "conferences_history"

    def __str__(self):
        return f"ConferencesHistory {self.pk}"
