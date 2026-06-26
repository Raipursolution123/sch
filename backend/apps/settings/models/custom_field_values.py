from django.db import models


class CustomFieldValues(models.Model):
    """Maps to `custom_field_values` in db_current."""

    id = models.AutoField(primary_key=True)
    belong_table_id = models.IntegerField(blank=True, null=True, db_index=True)
    custom_field_id = models.IntegerField(blank=True, null=True, db_index=True)
    field_value = models.CharField(max_length=500, blank=True, null=True, db_index=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "custom_field_values"

    def __str__(self):
        return f"CustomFieldValues {self.pk}"
