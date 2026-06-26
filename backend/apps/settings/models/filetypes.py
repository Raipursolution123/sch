from django.db import models


class Filetypes(models.Model):
    """Maps to `filetypes` in db_current."""

    id = models.AutoField(primary_key=True)
    file_extension = models.TextField(blank=True, null=True)
    file_mime = models.TextField(blank=True, null=True)
    file_size = models.IntegerField()
    image_extension = models.TextField(blank=True, null=True)
    image_mime = models.TextField(blank=True, null=True)
    image_size = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "filetypes"

    def __str__(self):
        return f"Filetypes {self.pk}"
