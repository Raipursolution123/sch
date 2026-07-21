from django.db import models


class StaffPayslip(models.Model):
    """Maps to `staff_payslip` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    basic = models.FloatField(blank=True, null=True, default=0.0)
    total_allowance = models.FloatField(blank=True, null=True, default=0.0)
    total_deduction = models.FloatField(blank=True, null=True, default=0.0)
    leave_deduction = models.IntegerField(blank=True, null=True, default=0)
    tax = models.CharField(max_length=200, blank=True, null=True, default="0")
    net_salary = models.FloatField(blank=True, null=True, default=0.0)
    status = models.CharField(max_length=100, blank=True, null=True, default="unpaid")
    month = models.CharField(max_length=200, blank=True, null=True)
    year = models.CharField(max_length=200, blank=True, null=True)
    payment_mode = models.CharField(max_length=200, blank=True, null=True)
    linked_ledger_bank = models.IntegerField(blank=True, null=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    transaction_id = models.CharField(max_length=44, blank=True, null=True)
    payment_date = models.DateField(blank=True, null=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    generated_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    payment_modes = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "staff_payslip"

    def __str__(self):
        return f"StaffPayslip {self.pk}"
