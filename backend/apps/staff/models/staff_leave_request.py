from django.db import models


class StaffLeaveRequest(models.Model):
    """Maps to `staff_leave_request` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    leave_type_id = models.IntegerField(blank=False, null=False, db_index=True)
    leave_from = models.DateField()
    leave_to = models.DateField()
    leave_days = models.IntegerField()
    employee_remark = models.CharField(max_length=200)
    admin_remark = models.CharField(max_length=200)
    status = models.CharField(max_length=50)
    applied_by = models.IntegerField(blank=True, null=True, db_index=True)
    document_file = models.CharField(max_length=200)
    date = models.DateField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "staff_leave_request"

    def __str__(self):
        return f"StaffLeaveRequest {self.pk}"
