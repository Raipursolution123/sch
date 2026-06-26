from django.db import models


class CycSchemeAndScholarshipStudent(models.Model):
    """Maps to `cyc_scheme_and_scholarship_student` in db_current."""

    sss_id = models.AutoField(primary_key=True)
    ss_id = models.IntegerField()
    student_id = models.IntegerField()
    applied_on = models.DateField()
    applied_by = models.IntegerField()
    applied_status = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_scheme_and_scholarship_student"

    def __str__(self):
        return f"CycSchemeAndScholarshipStudent {self.pk}"
