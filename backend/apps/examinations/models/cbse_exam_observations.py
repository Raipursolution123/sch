from django.db import models


class CbseExamObservations(models.Model):
    """Maps to `cbse_exam_observations` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_exam_observations"

    def __str__(self):
        return f"CbseExamObservations {self.pk}"
