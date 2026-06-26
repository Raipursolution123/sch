from django.db import models


class CustomFields(models.Model):
    """Maps to `custom_fields` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    belong_to = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    type = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    bs_column = models.IntegerField(blank=True, null=True)
    validation = models.IntegerField(blank=True, null=True, default=0)
    field_values = models.TextField(blank=True, null=True, db_index=True)
    show_table = models.CharField(max_length=100, blank=True, null=True)
    visible_on_table = models.IntegerField(db_index=True)
    weight = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "custom_fields"

    def __str__(self):
        return f"CustomFields {self.pk}"
