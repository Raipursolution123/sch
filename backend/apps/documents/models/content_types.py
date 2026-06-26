from django.db import models


class ContentTypes(models.Model):
    """Maps to `content_types` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=1)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "content_types"

    def __str__(self):
        return f"ContentTypes {self.pk}"
