from django.db import models


class DisableReason(models.Model):
    """Maps to `disable_reason` in db_current."""

    id = models.AutoField(primary_key=True)
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "disable_reason"

    def __str__(self):
        return f"DisableReason {self.pk}"
