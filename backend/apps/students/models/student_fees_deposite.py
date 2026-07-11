from django.db import models


class StudentFeesDeposite(models.Model):
    """Maps to `student_fees_deposite` in db_current."""

    id = models.AutoField(primary_key=True)
    student_fees_master_id = models.IntegerField(blank=True, null=True, db_index=True)
    fee_groups_feetype_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_transport_fee_id = models.IntegerField(blank=True, null=True, db_index=True)
    amount_detail = models.TextField(blank=True, null=True)
    file = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=10, default="no")
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_fees_deposite"

    def __str__(self):
        return f"StudentFeesDeposite {self.pk}"
