from django.db import models


class Events(models.Model):
    """Maps to `events` in db_current."""

    id = models.AutoField(primary_key=True)
    event_title = models.CharField(max_length=200)
    event_description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    event_type = models.CharField(max_length=100)
    event_color = models.CharField(max_length=200)
    event_for = models.CharField(max_length=100)
    role_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "events"

    def __str__(self):
        return f"Events {self.pk}"
