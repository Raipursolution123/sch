from django.db import models


class EmailConfig(models.Model):
    """Maps to `email_config` in db_current."""

    id = models.AutoField(primary_key=True)
    email_type = models.CharField(max_length=100, blank=True, null=True)
    smtp_server = models.CharField(max_length=100, blank=True, null=True)
    smtp_port = models.CharField(max_length=100, blank=True, null=True)
    smtp_username = models.CharField(max_length=100, blank=True, null=True)
    smtp_password = models.CharField(max_length=100, blank=True, null=True)
    ssl_tls = models.CharField(max_length=100, blank=True, null=True)
    smtp_auth = models.CharField(max_length=10)
    api_key = models.CharField(max_length=255, blank=True, null=True)
    api_secret = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "email_config"

    def __str__(self):
        return f"EmailConfig {self.pk}"
