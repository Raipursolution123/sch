from django.db import models


class OnlineCourseSettings(models.Model):
    """Maps to `online_course_settings` in db_current."""

    id = models.AutoField(primary_key=True)
    guest_prefix = models.CharField(max_length=50)
    guest_id_start_from = models.IntegerField()
    guest_login = models.IntegerField(blank=True, null=True, default=0)

    class Meta:
        managed = False
        db_table = "online_course_settings"

    def __str__(self):
        return f"OnlineCourseSettings {self.pk}"
