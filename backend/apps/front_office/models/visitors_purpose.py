from django.db import models


class VisitorsPurpose(models.Model):
    """Maps to `visitors_purpose` in db_current."""

    id = models.AutoField(primary_key=True)
    visitors_purpose = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "visitors_purpose"

    def __str__(self):
        return f"VisitorsPurpose {self.pk}"
