from django.db import models


class OnlineCourseProcessingPayment(models.Model):
    """Maps to `online_course_processing_payment` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    guest_id = models.IntegerField(blank=True, null=True)
    online_courses_id = models.IntegerField(blank=True, null=True, db_index=True)
    course_name = models.CharField(max_length=255, blank=True, null=True)
    actual_price = models.FloatField(default=0.00)
    paid_amount = models.FloatField(default=0.00)
    payment_mode = models.CharField(max_length=50, blank=True, null=True)
    payment_type = models.CharField(max_length=100, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    date = models.DateTimeField(blank=True, null=True)
    gateway_ins_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_course_processing_payment"

    def __str__(self):
        return f"OnlineCourseProcessingPayment {self.pk}"
