from django.db import models


class CycPtmSchedule(models.Model):
    """Maps to `cyc_ptm_schedule` in db_current."""

    ptms_id = models.AutoField(primary_key=True)
    ptm_id = models.IntegerField()
    student_id = models.IntegerField()
    parent_id = models.IntegerField()
    teacher_id = models.IntegerField()
    date = models.DateField()
    time_from = models.CharField(max_length=44)
    time_to = models.CharField(max_length=44)
    room = models.IntegerField()
    remark = models.TextField()

    class Meta:
        managed = False
        db_table = "cyc_ptm_schedule"

    def __str__(self):
        return f"CycPtmSchedule {self.pk}"
