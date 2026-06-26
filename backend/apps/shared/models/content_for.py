from django.db import models


class ContentFor(models.Model):
    """Maps to `content_for` in db_current."""

    id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    content_id = models.IntegerField(blank=True, null=True, db_index=True)
    user_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "content_for"

    def __str__(self):
        return f"ContentFor {self.pk}"
