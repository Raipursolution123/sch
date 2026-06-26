from django.db import models


class EnquiryType(models.Model):
    """Maps to `enquiry_type` in db_current."""

    id = models.AutoField(primary_key=True)
    enquiry_type = models.CharField(max_length=100)
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "enquiry_type"

    def __str__(self):
        return f"EnquiryType {self.pk}"
