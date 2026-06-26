from django.db import models


class ComplaintType(models.Model):
    """Maps to `complaint_type` in db_current."""

    id = models.AutoField(primary_key=True)
    complaint_type = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "complaint_type"

    def __str__(self):
        return f"ComplaintType {self.pk}"
