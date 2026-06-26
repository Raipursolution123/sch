from django.db import models


class CycStaffPayroll(models.Model):
    """Maps to `cyc_staff_payroll` in db_current."""

    id = models.AutoField(primary_key=True)
    employee_id = models.FloatField(blank=True, null=True, db_index=True)
    payroll_type = models.CharField(max_length=44)
    payroll_title = models.CharField(max_length=255)
    payroll_amount = models.FloatField()

    class Meta:
        managed = False
        db_table = "cyc_staff_payroll"

    def __str__(self):
        return f"CycStaffPayroll {self.pk}"
