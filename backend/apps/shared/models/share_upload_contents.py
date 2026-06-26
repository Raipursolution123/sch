from django.db import models


class ShareUploadContents(models.Model):
    """Maps to `share_upload_contents` in db_current."""

    id = models.AutoField(primary_key=True)
    upload_content_id = models.IntegerField(blank=True, null=True, db_index=True)
    share_content_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "share_upload_contents"

    def __str__(self):
        return f"ShareUploadContents {self.pk}"
