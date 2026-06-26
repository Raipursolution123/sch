from django.db import models


class ExamGroupClassBatchExams(models.Model):
    """Maps to `exam_group_class_batch_exams` in db_current."""

    id = models.AutoField(primary_key=True)
    exam = models.CharField(max_length=250, blank=True, null=True)
    passing_percentage = models.FloatField(blank=True, null=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    date_from = models.DateField(blank=True, null=True)
    date_to = models.DateField(blank=True, null=True)
    exam_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    use_exam_roll_no = models.IntegerField(default=1)
    is_publish = models.IntegerField(blank=True, null=True, default=0)
    is_rank_generated = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_group_class_batch_exams"

    def __str__(self):
        return f"ExamGroupClassBatchExams {self.pk}"
