from django.db import models


class ShareContentFor(models.Model):
    """Maps to `share_content_for` in db_current."""

    id = models.AutoField(primary_key=True)
    group_id = models.CharField(max_length=20, blank=True, null=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    user_parent_id = models.IntegerField(blank=True, null=True, db_index=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    share_content_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "share_content_for"

    def __str__(self):
        return f"ShareContentFor {self.pk}"
