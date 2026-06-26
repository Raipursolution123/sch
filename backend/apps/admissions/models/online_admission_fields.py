from django.db import models


class OnlineAdmissionFields(models.Model):
    """Maps to `online_admission_fields` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "online_admission_fields"

    def __str__(self):
        return f"OnlineAdmissionFields {self.pk}"
