from django.db import models


class Grades(models.Model):
    """Maps to `grades` in db_current."""

    id = models.AutoField(primary_key=True)
    exam_type = models.CharField(max_length=250, blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    point = models.FloatField(blank=True, null=True)
    mark_from = models.FloatField(blank=True, null=True)
    mark_upto = models.FloatField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "grades"

    def __str__(self):
        return f"Grades {self.pk}"
