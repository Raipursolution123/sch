from django.db import models


class CycStaffPayrollIncrement(models.Model):
    """Maps to `cyc_staff_payroll_increment` in db_current."""

    pi_id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField()
    month = models.CharField(max_length=44, blank=True, null=True)
    year = models.CharField(max_length=44, blank=True, null=True)
    basic_salary = models.FloatField()
    increment = models.FloatField()
    date = models.DateField()
    entry_by = models.IntegerField()
    status = models.CharField(max_length=44, default="pending")
    action_by = models.IntegerField()
    action_date = models.DateField()

    class Meta:
        managed = False
        db_table = "cyc_staff_payroll_increment"

    def __str__(self):
        return f"CycStaffPayrollIncrement {self.pk}"
