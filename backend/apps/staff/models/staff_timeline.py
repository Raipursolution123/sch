from django.db import models


class StaffTimeline(models.Model):
    """Maps to `staff_timeline` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    title = models.CharField(max_length=200)
    timeline_date = models.DateField()
    description = models.CharField(max_length=300)
    document = models.CharField(max_length=200)
    status = models.CharField(max_length=200)
    date = models.DateField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "staff_timeline"

    def __str__(self):
        return f"StaffTimeline {self.pk}"
