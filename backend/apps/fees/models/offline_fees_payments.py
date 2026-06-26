from django.db import models


class OfflineFeesPayments(models.Model):
    """Maps to `offline_fees_payments` in db_current."""

    id = models.AutoField(primary_key=True)
    invoice_id = models.CharField(max_length=50, blank=True, null=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_fees_master_id = models.IntegerField(blank=True, null=True, db_index=True)
    fee_groups_feetype_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_transport_fee_id = models.IntegerField(blank=True, null=True, db_index=True)
    payment_date = models.DateField(blank=True, null=True)
    bank_from = models.CharField(max_length=200, blank=True, null=True)
    bank_account_transferred = models.CharField(max_length=200, blank=True, null=True)
    reference = models.CharField(max_length=200, blank=True, null=True)
    amount = models.FloatField(blank=True, null=True)
    submit_date = models.DateTimeField(blank=True, null=True)
    approve_date = models.DateTimeField(blank=True, null=True)
    attachment = models.TextField(blank=True, null=True)
    reply = models.TextField(blank=True, null=True)
    approved_by = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.CharField(max_length=1, blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    alt_mobile_no = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "offline_fees_payments"

    def __str__(self):
        return f"OfflineFeesPayments {self.pk}"
