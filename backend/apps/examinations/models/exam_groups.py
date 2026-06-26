from django.db import models


class ExamGroups(models.Model):
    """Maps to `exam_groups` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250, blank=True, null=True)
    exam_type = models.CharField(max_length=250, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=1)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_groups"

    def __str__(self):
        return f"ExamGroups {self.pk}"
