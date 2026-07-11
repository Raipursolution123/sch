from django.db import models


class AttendenceType(models.Model):
    """Maps to `attendence_type` in db_current."""

    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    key_value = models.CharField(max_length=50)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "attendence_type"

    def __str__(self):
        return f"AttendenceType {self.pk}"
