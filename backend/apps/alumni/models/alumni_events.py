from django.db import models


class AlumniEvents(models.Model):
    """Maps to `alumni_events` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.TextField()
    event_for = models.CharField(max_length=100)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    section = models.CharField(max_length=255)
    from_date = models.DateTimeField()
    to_date = models.DateTimeField()
    note = models.TextField()
    photo = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.IntegerField()
    event_notification_message = models.TextField()
    show_onwebsite = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "alumni_events"

    def __str__(self):
        return f"AlumniEvents {self.pk}"
