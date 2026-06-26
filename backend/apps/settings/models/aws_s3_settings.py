from django.db import models


class AwsS3Settings(models.Model):
    """Maps to `aws_s3_settings` in db_current."""

    id = models.AutoField(primary_key=True)
    api_key = models.CharField(max_length=250, blank=True, null=True)
    api_secret = models.CharField(max_length=250, blank=True, null=True)
    bucket_name = models.CharField(max_length=250, blank=True, null=True)
    region = models.CharField(max_length=250, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "aws_s3_settings"

    def __str__(self):
        return f"AwsS3Settings {self.pk}"
