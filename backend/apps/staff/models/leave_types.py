from django.db import models


class LeaveTypes(models.Model):
    """Maps to `leave_types` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=200, db_index=True)
    is_active = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = "leave_types"

    def __str__(self):
        return f"LeaveTypes {self.pk}"
