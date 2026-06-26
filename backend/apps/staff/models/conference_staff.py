from django.db import models


class ConferenceStaff(models.Model):
    """Maps to `conference_staff` in db_current."""

    id = models.AutoField(primary_key=True)
    conference_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "conference_staff"

    def __str__(self):
        return f"ConferenceStaff {self.pk}"
