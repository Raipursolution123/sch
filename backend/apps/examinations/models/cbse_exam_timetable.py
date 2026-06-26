from django.db import models


class CbseExamTimetable(models.Model):
    """Maps to `cbse_exam_timetable` in db_current."""

    id = models.AutoField(primary_key=True)
    cbse_exam_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    date = models.DateField()
    time_from = models.TimeField()
    time_to = models.TimeField()
    duration = models.IntegerField()
    room_no = models.CharField(max_length=255)
    is_written = models.IntegerField(default=1)
    written_maximum_marks = models.TextField()
    is_practical = models.IntegerField()
    practical_maximum_mark = models.TextField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    scholastic_area = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cbse_exam_timetable"

    def __str__(self):
        return f"CbseExamTimetable {self.pk}"
