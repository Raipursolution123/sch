from django.db import models


class GatewayIns(models.Model):
    """Maps to `gateway_ins` in db_current."""

    id = models.AutoField(primary_key=True)
    online_admission_id = models.IntegerField(blank=True, null=True, db_index=True)
    gateway_name = models.CharField(max_length=50)
    module_type = models.CharField(max_length=255)
    unique_id = models.CharField(max_length=255)
    parameter_details = models.TextField()
    payment_status = models.CharField(max_length=255)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "gateway_ins"

    def __str__(self):
        return f"GatewayIns {self.pk}"
