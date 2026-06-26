from django.db import models


class MarkDivisions(models.Model):
    """Maps to `mark_divisions` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    percentage_from = models.FloatField(blank=True, null=True)
    percentage_to = models.FloatField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "mark_divisions"

    def __str__(self):
        return f"MarkDivisions {self.pk}"
