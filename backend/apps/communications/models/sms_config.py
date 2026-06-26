from django.db import models


class SmsConfig(models.Model):
    """Maps to `sms_config` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    api_id = models.CharField(max_length=100)
    authkey = models.CharField(max_length=100)
    senderid = models.CharField(max_length=100)
    contact = models.TextField(blank=True, null=True)
    username = models.CharField(max_length=150, blank=True, null=True)
    url = models.CharField(max_length=150, blank=True, null=True)
    password = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='disabled')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "sms_config"

    def __str__(self):
        return f"SmsConfig {self.pk}"
