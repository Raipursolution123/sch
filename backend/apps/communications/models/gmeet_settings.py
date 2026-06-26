from django.db import models


class GmeetSettings(models.Model):
    """Maps to `gmeet_settings` in db_current."""

    id = models.IntegerField(primary_key=True)
    api_key = models.CharField(max_length=200, blank=True, null=True)
    api_secret = models.CharField(max_length=200, blank=True, null=True)
    use_api = models.IntegerField(blank=True, null=True, default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "gmeet_settings"

    def __str__(self):
        return f"GmeetSettings {self.pk}"
