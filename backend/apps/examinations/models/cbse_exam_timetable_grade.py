from django.db import models


class CbseExamTimetableGrade(models.Model):
    """Maps to `cbse_exam_timetable_grade` in db_current."""

    tg_id = models.AutoField(primary_key=True)
    cbse_exam_timetable_id = models.IntegerField()
    cbse_exam_id = models.IntegerField()
    subject_id = models.IntegerField()
    grade_value = models.CharField(max_length=44)
    grade_min_per = models.IntegerField()
    grade_max_per = models.IntegerField()
    grade_desc = models.TextField()

    class Meta:
        managed = False
        db_table = "cbse_exam_timetable_grade"

    def __str__(self):
        return f"CbseExamTimetableGrade {self.pk}"
