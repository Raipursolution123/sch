from django.db import models


class Captcha(models.Model):
    """Maps to `captcha` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=250)
    status = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "captcha"

    def __str__(self):
        return f"Captcha {self.pk}"
