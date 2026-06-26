from django.db import models


class EmailAttachments(models.Model):
    """Maps to `email_attachments` in db_current."""

    id = models.AutoField(primary_key=True)
    message_id = models.IntegerField(blank=False, null=False, db_index=True)
    directory = models.CharField(max_length=255)
    attachment = models.CharField(max_length=255)
    attachment_name = models.CharField(max_length=200)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "email_attachments"

    def __str__(self):
        return f"EmailAttachments {self.pk}"
