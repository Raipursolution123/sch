from django.db import models


class Logs(models.Model):
    """Maps to `logs` in db_current."""

    id = models.AutoField(primary_key=True)
    message = models.TextField(blank=True, null=True)
    record_id = models.TextField(blank=True, null=True)
    user_id = models.IntegerField(blank=True, null=True)
    action = models.CharField(max_length=50, blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    platform = models.CharField(max_length=50, blank=True, null=True)
    agent = models.CharField(max_length=50, blank=True, null=True)
    time = models.DateTimeField()
    created_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "logs"

    def __str__(self):
        return f"Logs {self.pk}"
