from django.db import models


class SendNotification(models.Model):
    """Maps to `send_notification` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50, blank=True, null=True)
    publish_date = models.DateField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    attachment = models.CharField(max_length=500, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    visible_student = models.CharField(max_length=10, default='no')
    visible_staff = models.CharField(max_length=10, default='no')
    visible_parent = models.CharField(max_length=10, default='no')
    created_by = models.CharField(max_length=60, blank=True, null=True)
    created_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "send_notification"

    def __str__(self):
        return f"SendNotification {self.pk}"
