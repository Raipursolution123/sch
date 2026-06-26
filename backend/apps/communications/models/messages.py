from django.db import models


class Messages(models.Model):
    """Maps to `messages` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    template_id = models.CharField(max_length=100, blank=True, null=True)
    email_template_id = models.IntegerField(blank=True, null=True)
    sms_template_id = models.IntegerField(blank=True, null=True)
    send_through = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    send_mail = models.CharField(max_length=10, blank=True, null=True, default=0)
    send_sms = models.CharField(max_length=10, blank=True, null=True, default=0)
    is_group = models.CharField(max_length=10, blank=True, null=True, default=0)
    is_individual = models.CharField(max_length=10, blank=True, null=True, default=0)
    is_class = models.IntegerField(default=0)
    is_schedule = models.IntegerField()
    sent = models.IntegerField(blank=True, null=True)
    schedule_date_time = models.DateTimeField(blank=True, null=True)
    group_list = models.TextField(blank=True, null=True)
    user_list = models.TextField(blank=True, null=True)
    schedule_class = models.IntegerField(blank=True, null=True)
    schedule_section = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "messages"

    def __str__(self):
        return f"Messages {self.pk}"
