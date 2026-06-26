from django.db import models


class ZoomSettings(models.Model):
    """Maps to `zoom_settings` in db_current."""

    id = models.AutoField(primary_key=True)
    zoom_api_key = models.CharField(max_length=200, blank=True, null=True)
    zoom_api_secret = models.CharField(max_length=200, blank=True, null=True)
    use_teacher_api = models.IntegerField(blank=True, null=True, default=1)
    use_zoom_app = models.IntegerField(blank=True, null=True, default=1)
    use_zoom_app_user = models.IntegerField(blank=True, null=True, default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "zoom_settings"

    def __str__(self):
        return f"ZoomSettings {self.pk}"
