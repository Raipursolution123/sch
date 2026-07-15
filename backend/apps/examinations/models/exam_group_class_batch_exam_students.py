from django.db import models


class ExamGroupClassBatchExamStudents(models.Model):
    """Maps to `exam_group_class_batch_exam_students` in db_current."""

    id = models.AutoField(primary_key=True)
    exam_group_class_batch_exam_id = models.IntegerField(
        blank=False, null=False, db_index=True
    )
    student_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_session_id = models.IntegerField(blank=False, null=False, db_index=True)
    roll_no = models.IntegerField(blank=True, null=True)
    teacher_remark = models.TextField(blank=True, null=True)
    rank = models.IntegerField(default=0)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_group_class_batch_exam_students"

    def __str__(self):
        return f"ExamGroupClassBatchExamStudents {self.pk}"
