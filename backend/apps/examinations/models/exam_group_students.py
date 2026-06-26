from django.db import models


class ExamGroupStudents(models.Model):
    """Maps to `exam_group_students` in db_current."""

    id = models.AutoField(primary_key=True)
    exam_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exam_group_students"

    def __str__(self):
        return f"ExamGroupStudents {self.pk}"
