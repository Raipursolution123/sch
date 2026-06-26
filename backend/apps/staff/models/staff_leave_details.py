from django.db import models


class StaffLeaveDetails(models.Model):
    """Maps to `staff_leave_details` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    leave_type_id = models.IntegerField(blank=False, null=False, db_index=True)
    alloted_leave = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "staff_leave_details"

    def __str__(self):
        return f"StaffLeaveDetails {self.pk}"
