from django.db import models


class Conferences(models.Model):
    """Maps to `conferences` in db_current."""

    id = models.AutoField(primary_key=True)
    purpose = models.CharField(max_length=20, default="class")
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_id = models.IntegerField(blank=False, null=False, db_index=True)
    title = models.TextField(blank=True, null=True)
    date = models.DateTimeField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    password = models.CharField(max_length=50, blank=True, null=True)
    subject = models.CharField(max_length=50, blank=True, null=True)
    class_id = models.IntegerField(blank=True, null=True)
    section_id = models.IntegerField(blank=True, null=True)
    session_id = models.IntegerField()
    host_video = models.IntegerField(default=1)
    client_video = models.IntegerField(default=1)
    description = models.CharField(max_length=50, blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, null=True)
    return_response = models.TextField(blank=True, null=True)
    api_type = models.CharField(max_length=30)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "conferences"

    def __str__(self):
        return f"Conferences {self.pk}"
