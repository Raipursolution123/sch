from django.db import models


class Gmeet(models.Model):
    """Maps to `gmeet` in db_current."""

    id = models.AutoField(primary_key=True)
    purpose = models.CharField(max_length=20, default='class')
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_id = models.IntegerField(blank=False, null=False, db_index=True)
    title = models.TextField(blank=True, null=True)
    date = models.DateTimeField(blank=True, null=True)
    type = models.CharField(max_length=20, default='manual')
    api_data = models.TextField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    subject = models.CharField(max_length=50, blank=True, null=True)
    url = models.TextField()
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    description = models.CharField(max_length=50, blank=True, null=True)
    timezone = models.CharField(max_length=100, blank=True, null=True)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "gmeet"

    def __str__(self):
        return f"Gmeet {self.pk}"
