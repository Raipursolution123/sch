from django.db import models


class ExamGroupExamConnections(models.Model):
    """Maps to `exam_group_exam_connections` in db_current."""

    id = models.AutoField(primary_key=True)
    exam_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    exam_group_class_batch_exams_id = models.IntegerField(blank=True, null=True, db_index=True)
    exam_weightage = models.FloatField(blank=True, null=True, default=0.00)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_group_exam_connections"

    def __str__(self):
        return f"ExamGroupExamConnections {self.pk}"
