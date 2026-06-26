from django.db import models


class FeesReminder(models.Model):
    """Maps to `fees_reminder` in db_current."""

    id = models.AutoField(primary_key=True)
    reminder_type = models.CharField(max_length=10, blank=True, null=True)
    day = models.IntegerField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "fees_reminder"

    def __str__(self):
        return f"FeesReminder {self.pk}"
