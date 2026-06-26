from django.db import models


class GatewayInsResponse(models.Model):
    """Maps to `gateway_ins_response` in db_current."""

    id = models.AutoField(primary_key=True)
    gateway_ins_id = models.IntegerField(blank=True, null=True, db_index=True)
    posted_data = models.TextField(blank=True, null=True)
    response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "gateway_ins_response"

    def __str__(self):
        return f"GatewayInsResponse {self.pk}"
