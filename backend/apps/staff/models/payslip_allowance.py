from django.db import models


class PayslipAllowance(models.Model):
    """Maps to `payslip_allowance` in db_current."""

    id = models.AutoField(primary_key=True)
    payslip_id = models.IntegerField(blank=False, null=False, db_index=True)
    allowance_type = models.CharField(max_length=200)
    amount = models.TextField()
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    cal_type = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "payslip_allowance"

    def __str__(self):
        return f"PayslipAllowance {self.pk}"
