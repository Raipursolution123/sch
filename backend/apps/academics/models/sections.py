from django.db import models


class Sections(models.Model):
    """Maps to `sections` in db_current."""

    id = models.AutoField(primary_key=True)
    section = models.CharField(max_length=60, blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "sections"

    def __str__(self):
        return f"Sections {self.pk}"
