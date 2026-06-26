from django.db import models


class EmailTemplate(models.Model):
    """Maps to `email_template` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateField()

    class Meta:
        managed = False
        db_table = "email_template"

    def __str__(self):
        return f"EmailTemplate {self.pk}"
