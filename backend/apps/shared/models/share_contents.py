from django.db import models


class ShareContents(models.Model):
    """Maps to `share_contents` in db_current."""

    id = models.AutoField(primary_key=True)
    send_to = models.CharField(max_length=50, blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    share_date = models.DateField(blank=True, null=True)
    valid_upto = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "share_contents"

    def __str__(self):
        return f"ShareContents {self.pk}"
