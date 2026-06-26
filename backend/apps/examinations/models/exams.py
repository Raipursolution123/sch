from django.db import models


class Exams(models.Model):
    """Maps to `exams` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    sesion_id = models.IntegerField(blank=False, null=False, db_index=True)
    note = models.TextField(blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "exams"

    def __str__(self):
        return f"Exams {self.pk}"
