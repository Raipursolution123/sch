from django.db import models


class ExamGroupClassBatchExamSubjects(models.Model):
    """Maps to `exam_group_class_batch_exam_subjects` in db_current."""

    id = models.AutoField(primary_key=True)
    exam_group_class_batch_exams_id = models.IntegerField(
        blank=True, null=True, db_index=True
    )
    subject_id = models.IntegerField(blank=False, null=False, db_index=True)
    date_from = models.DateField()
    time_from = models.TimeField()
    duration = models.CharField(max_length=50)
    room_no = models.CharField(max_length=100, blank=True, null=True)
    max_marks = models.FloatField(blank=True, null=True)
    min_marks = models.FloatField(blank=True, null=True)
    credit_hours = models.FloatField(blank=True, null=True, default=0.00)
    date_to = models.DateTimeField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_group_class_batch_exam_subjects"

    def __str__(self):
        return f"ExamGroupClassBatchExamSubjects {self.pk}"
