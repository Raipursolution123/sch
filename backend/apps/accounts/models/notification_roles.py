from django.db import models


class NotificationRoles(models.Model):
    """Maps to `notification_roles` in db_current."""

    id = models.AutoField(primary_key=True)
    send_notification_id = models.IntegerField(blank=True, null=True, db_index=True)
    role_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "notification_roles"

    def __str__(self):
        return f"NotificationRoles {self.pk}"
