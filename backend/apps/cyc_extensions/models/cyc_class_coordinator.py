from django.db import models


class CycClassCoordinator(models.Model):
    """Maps to `cyc_class_coordinator` in db_current."""

    cc_id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField()
    class_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_class_coordinator"

    def __str__(self):
        return f"CycClassCoordinator {self.pk}"
