from django.db import models


class CbseStudentSubjectMarks(models.Model):
    """Maps to `cbse_student_subject_marks` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_timetable_assessment_type_id = models.IntegerField(blank=False, null=False, db_index=True)
    cbse_exam_timetable_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_exam_student_id = models.IntegerField(blank=True, null=True, db_index=True)
    cbse_exam_assessment_type_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_absent = models.IntegerField(default=0)
    marks = models.FloatField(blank=True, null=True, default=0.00)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    marks_grade = models.CharField(max_length=44, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cbse_student_subject_marks"

    def __str__(self):
        return f"CbseStudentSubjectMarks {self.pk}"
