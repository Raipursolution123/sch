from django.db import models


class CycStudentAddonFee(models.Model):
    """Maps to `cyc_student_addon_fee` in db_current."""

    af_id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()
    amount = models.FloatField()
    remark = models.TextField()
    date = models.DateField()
    entry_by = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_student_addon_fee"

    def __str__(self):
        return f"CycStudentAddonFee {self.pk}"
