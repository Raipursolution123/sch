from django.db import models


class ReadNotification(models.Model):
    """Maps to `read_notification` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    parent_id = models.IntegerField(blank=True, null=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    notification_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "read_notification"

    def __str__(self):
        return f"ReadNotification {self.pk}"
