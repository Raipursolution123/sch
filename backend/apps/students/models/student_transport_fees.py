from django.db import models


class StudentTransportFees(models.Model):
    """Maps to `student_transport_fees` in db_current."""

    id = models.AutoField(primary_key=True)
    transport_feemaster_id = models.IntegerField(blank=False, null=False, db_index=True)
    student_session_id = models.IntegerField(blank=False, null=False, db_index=True)
    route_pickup_point_id = models.IntegerField(blank=False, null=False, db_index=True)
    generated_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_transport_fees"

    def __str__(self):
        return f"StudentTransportFees {self.pk}"
