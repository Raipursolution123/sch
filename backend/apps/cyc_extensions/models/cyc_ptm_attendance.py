from django.db import models


class CycPtmAttendance(models.Model):
    """Maps to `cyc_ptm_attendance` in db_current."""

    ptma_id = models.AutoField(primary_key=True)
    ptm_id = models.IntegerField()
    student_id = models.IntegerField()
    parent_id = models.IntegerField()
    teacher_id = models.IntegerField()
    feedback_score = models.IntegerField()
    feedback_remark = models.TextField()
    parents_complain = models.TextField()
    special_case = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_ptm_attendance"

    def __str__(self):
        return f"CycPtmAttendance {self.pk}"
