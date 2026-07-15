from django.db import models


class ExamGroupExamResults(models.Model):
    """Maps to `exam_group_exam_results` in db_current."""

    id = models.AutoField(primary_key=True)
    exam_group_class_batch_exam_student_id = models.IntegerField(
        blank=False, null=False, db_index=True
    )
    exam_group_class_batch_exam_subject_id = models.IntegerField(
        blank=True, null=True, db_index=True
    )
    exam_group_student_id = models.IntegerField(blank=True, null=True, db_index=True)
    attendence = models.CharField(max_length=10, blank=True, null=True)
    get_marks = models.FloatField(blank=True, null=True, default=0.00)
    note = models.TextField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_group_exam_results"

    def __str__(self):
        return f"ExamGroupExamResults {self.pk}"
