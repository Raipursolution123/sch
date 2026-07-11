from django.db import models


class Sessions(models.Model):
    """Maps to `sessions` in db_current."""

    id = models.AutoField(primary_key=True)
    session = models.CharField(max_length=60, blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "sessions"

    def __str__(self):
        return f"Sessions {self.pk}"
