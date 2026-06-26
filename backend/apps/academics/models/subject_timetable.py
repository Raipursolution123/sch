from django.db import models


class SubjectTimetable(models.Model):
    """Maps to `subject_timetable` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    section_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_group_subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    day = models.CharField(max_length=20, blank=True, null=True)
    time_from = models.CharField(max_length=20, blank=True, null=True)
    time_to = models.CharField(max_length=20, blank=True, null=True)
    start_time = models.TimeField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    room_no = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "subject_timetable"

    def __str__(self):
        return f"SubjectTimetable {self.pk}"
