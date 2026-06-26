from django.db import models


class StudentFees(models.Model):
    """Maps to `student_fees` in db_current."""

    id = models.AutoField(primary_key=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    feemaster_id = models.IntegerField(blank=True, null=True, db_index=True)
    amount = models.FloatField(blank=True, null=True)
    amount_discount = models.FloatField()
    amount_fine = models.FloatField(default=0.00)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    payment_mode = models.CharField(max_length=50)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "student_fees"

    def __str__(self):
        return f"StudentFees {self.pk}"
