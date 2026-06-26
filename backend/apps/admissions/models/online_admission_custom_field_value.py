from django.db import models


class OnlineAdmissionCustomFieldValue(models.Model):
    """Maps to `online_admission_custom_field_value` in db_current."""

    id = models.AutoField(primary_key=True)
    belong_table_id = models.IntegerField(blank=True, null=True)
    custom_field_id = models.IntegerField(blank=True, null=True, db_index=True)
    field_value = models.TextField()
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "online_admission_custom_field_value"

    def __str__(self):
        return f"OnlineAdmissionCustomFieldValue {self.pk}"
