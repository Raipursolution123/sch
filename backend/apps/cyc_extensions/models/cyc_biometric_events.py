from django.db import models


class CycBiometricEvents(models.Model):
    """Maps to `cyc_biometric_events` in db_current."""

    id = models.AutoField(primary_key=True)
    link_to = models.CharField(max_length=44)
    event_date = models.DateField()
    event_time = models.CharField(max_length=44)
    event_card_id = models.CharField(max_length=255)
    event_timestamp = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cyc_biometric_events"

    def __str__(self):
        return f"CycBiometricEvents {self.pk}"
