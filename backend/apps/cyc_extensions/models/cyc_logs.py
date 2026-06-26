from django.db import models


class CycLogs(models.Model):
    """Maps to `cyc_logs` in db_current."""

    id = models.AutoField(primary_key=True)
    date = models.DateTimeField()
    level = models.IntegerField()
    host_ip = models.CharField(max_length=25)
    user_id = models.CharField(max_length=25)
    url = models.CharField(max_length=255)
    user_agent = models.CharField(max_length=300)
    message = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "cyc_logs"

    def __str__(self):
        return f"CycLogs {self.pk}"
