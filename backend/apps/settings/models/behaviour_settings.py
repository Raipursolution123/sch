from django.db import models


class BehaviourSettings(models.Model):
    """Maps to `behaviour_settings` in db_current."""

    id = models.AutoField(primary_key=True)
    comment_option = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "behaviour_settings"

    def __str__(self):
        return f"BehaviourSettings {self.pk}"
