from django.db import models


class StudentFeesMaster(models.Model):
    """Maps to `student_fees_master` in db_current."""

    id = models.AutoField(primary_key=True)
    is_system = models.IntegerField(default=0)
    student_session_id = models.IntegerField(blank=True, null=True, db_index=True)
    fee_session_group_id = models.IntegerField(blank=True, null=True, db_index=True)
    amount = models.FloatField(blank=True, null=True, default="0.00")
    is_active = models.CharField(max_length=10, default="no")
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_fees_master"

    def __str__(self):
        return f"StudentFeesMaster {self.pk}"
