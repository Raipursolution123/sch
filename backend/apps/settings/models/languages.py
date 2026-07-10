from django.db import models


class Languages(models.Model):
    """Maps to `languages` in db_current."""

    id = models.AutoField(primary_key=True)
    language = models.CharField(max_length=50, blank=True, null=True)
    short_code = models.CharField(max_length=255)
    country_code = models.CharField(max_length=255)
    is_rtl = models.IntegerField()
    is_deleted = models.CharField(max_length=10, default="yes")
    is_active = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "languages"

    def __str__(self):
        return f"Languages {self.pk}"
