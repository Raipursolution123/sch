from django.db import models


class CycHoliday(models.Model):
    """Maps to `cyc_holiday` in db_current."""

    id = models.AutoField(primary_key=True)
    date = models.DateField()
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "cyc_holiday"

    def __str__(self):
        return f"CycHoliday {self.pk}"
