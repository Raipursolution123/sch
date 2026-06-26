from django.db import models


class OnlineAdmissionPayment(models.Model):
    """Maps to `online_admission_payment` in db_current."""

    id = models.AutoField(primary_key=True)
    online_admission_id = models.IntegerField(blank=False, null=False, db_index=True)
    paid_amount = models.FloatField()
    payment_mode = models.CharField(max_length=50)
    payment_type = models.CharField(max_length=100)
    transaction_id = models.CharField(max_length=100)
    note = models.CharField(max_length=100)
    date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "online_admission_payment"

    def __str__(self):
        return f"OnlineAdmissionPayment {self.pk}"
