from django.db import models


class Contents(models.Model):
    """Maps to `contents` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    is_public = models.CharField(max_length=10, blank=True, null=True, default='No')
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    cls_sec_id = models.IntegerField(blank=True, null=True, db_index=True)
    file = models.CharField(max_length=250, blank=True, null=True)
    date = models.DateField()
    note = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_by = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "contents"

    def __str__(self):
        return f"Contents {self.pk}"
