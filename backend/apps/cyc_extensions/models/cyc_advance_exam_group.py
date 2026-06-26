from django.db import models


class CycAdvanceExamGroup(models.Model):
    """Maps to `cyc_advance_exam_group` in db_current."""

    exam_group_id = models.AutoField(primary_key=True)
    group_title = models.CharField(max_length=255)
    group_code = models.CharField(max_length=255)
    group_description = models.TextField()
    group_term = models.IntegerField()
    created_by = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_advance_exam_group"

    def __str__(self):
        return f"CycAdvanceExamGroup {self.pk}"
