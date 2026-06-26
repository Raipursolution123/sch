from django.db import models


class NotificationSetting(models.Model):
    """Maps to `notification_setting` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=100, blank=True, null=True)
    is_mail = models.CharField(max_length=10, blank=True, null=True, default=0)
    is_sms = models.CharField(max_length=10, blank=True, null=True, default=0)
    is_notification = models.IntegerField(default=0)
    display_notification = models.IntegerField(default=0)
    display_sms = models.IntegerField(default=1)
    is_student_recipient = models.IntegerField(blank=True, null=True)
    is_guardian_recipient = models.IntegerField(blank=True, null=True)
    is_staff_recipient = models.IntegerField(blank=True, null=True)
    display_student_recipient = models.IntegerField(blank=True, null=True)
    display_guardian_recipient = models.IntegerField(blank=True, null=True)
    display_staff_recipient = models.IntegerField(blank=True, null=True)
    subject = models.CharField(max_length=255)
    template_id = models.CharField(max_length=100)
    template = models.TextField()
    variables = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "notification_setting"

    def __str__(self):
        return f"NotificationSetting {self.pk}"
