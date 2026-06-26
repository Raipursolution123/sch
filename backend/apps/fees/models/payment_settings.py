from django.db import models


class PaymentSettings(models.Model):
    """Maps to `payment_settings` in db_current."""

    id = models.AutoField(primary_key=True)
    payment_type = models.CharField(max_length=200)
    api_username = models.CharField(max_length=200, blank=True, null=True)
    api_secret_key = models.CharField(max_length=200)
    salt = models.CharField(max_length=200)
    api_publishable_key = models.CharField(max_length=200)
    api_password = models.CharField(max_length=200, blank=True, null=True)
    api_signature = models.CharField(max_length=200, blank=True, null=True)
    api_email = models.CharField(max_length=200, blank=True, null=True)
    paypal_demo = models.CharField(max_length=100)
    account_no = models.CharField(max_length=200)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    gateway_mode = models.IntegerField()
    paytm_website = models.CharField(max_length=255)
    paytm_industrytype = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "payment_settings"

    def __str__(self):
        return f"PaymentSettings {self.pk}"
