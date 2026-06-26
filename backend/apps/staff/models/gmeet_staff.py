from django.db import models


class GmeetStaff(models.Model):
    """Maps to `gmeet_staff` in db_current."""

    id = models.AutoField(primary_key=True)
    gmeet_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "gmeet_staff"

    def __str__(self):
        return f"GmeetStaff {self.pk}"
