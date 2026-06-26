from django.db import models


class SubjectGroups1(models.Model):
    """Maps to `subject_groups1` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250, blank=True, null=True)
    parent_subject_group_id = models.IntegerField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "subject_groups1"

    def __str__(self):
        return f"SubjectGroups1 {self.pk}"
