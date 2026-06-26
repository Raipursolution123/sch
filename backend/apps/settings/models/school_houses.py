from django.db import models


class SchoolHouses(models.Model):
    """Maps to `school_houses` in db_current."""

    id = models.AutoField(primary_key=True)
    house_name = models.CharField(max_length=200)
    description = models.CharField(max_length=400)
    house_incharge = models.IntegerField(blank=True, null=True)
    house_president = models.IntegerField(blank=True, null=True)
    is_active = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = "school_houses"

    def __str__(self):
        return f"SchoolHouses {self.pk}"
