from django.db import models


class StaffPayroll(models.Model):
    """Maps to `staff_payroll` in db_current."""

    id = models.AutoField(primary_key=True)
    basic_salary = models.IntegerField()
    pay_scale = models.CharField(max_length=200)
    grade = models.CharField(max_length=50)
    is_active = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = "staff_payroll"

    def __str__(self):
        return f"StaffPayroll {self.pk}"
