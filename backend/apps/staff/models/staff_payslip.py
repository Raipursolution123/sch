from django.db import models


class StaffPayslip(models.Model):
    """Maps to `staff_payslip` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    basic = models.FloatField()
    total_allowance = models.FloatField()
    total_deduction = models.FloatField()
    leave_deduction = models.IntegerField()
    tax = models.CharField(max_length=200)
    net_salary = models.FloatField()
    status = models.CharField(max_length=100)
    month = models.CharField(max_length=200)
    year = models.CharField(max_length=200)
    payment_mode = models.CharField(max_length=200)
    linked_ledger_bank = models.IntegerField(blank=True, null=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    transaction_id = models.CharField(max_length=44, blank=True, null=True)
    payment_date = models.DateField()
    remark = models.CharField(max_length=200)
    generated_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    payment_modes = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "staff_payslip"

    def __str__(self):
        return f"StaffPayslip {self.pk}"
