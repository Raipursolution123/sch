from django.db import models


class Feemasters(models.Model):
    """Maps to `feemasters` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    feetype_id = models.IntegerField(blank=False, null=False, db_index=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    amount = models.FloatField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="no")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "feemasters"

    def __str__(self):
        return f"Feemasters {self.pk}"
