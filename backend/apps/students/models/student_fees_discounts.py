from django.db import models


class StudentFeesDiscounts(models.Model):
    """Maps to `student_fees_discounts` in db_current."""

    id = models.AutoField(primary_key=True)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    fees_discount_id = models.IntegerField(blank=True, null=True, db_index=True)
    status = models.CharField(max_length=20, blank=True, null=True, default='assigned')
    payment_id = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_fees_discounts"

    def __str__(self):
        return f"StudentFeesDiscounts {self.pk}"
