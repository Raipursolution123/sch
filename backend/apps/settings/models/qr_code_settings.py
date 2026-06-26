from django.db import models


class QrCodeSettings(models.Model):
    """Maps to `qr_code_settings` in db_current."""

    id = models.IntegerField(primary_key=True)
    camera_type = models.CharField(max_length=15, blank=True, null=True)
    auto_attendance = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "qr_code_settings"

    def __str__(self):
        return f"QrCodeSettings {self.pk}"
