from django.db import models


class EmailTemplateAttachment(models.Model):
    """Maps to `email_template_attachment` in db_current."""

    id = models.AutoField(primary_key=True)
    email_template_id = models.IntegerField()
    attachment = models.CharField(max_length=100)
    attachment_name = models.TextField()

    class Meta:
        managed = False
        db_table = "email_template_attachment"

    def __str__(self):
        return f"EmailTemplateAttachment {self.pk}"
