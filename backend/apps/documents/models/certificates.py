from django.db import models


class Certificates(models.Model):
    """Maps to `certificates` in db_current."""

    id = models.AutoField(primary_key=True)
    certificate_name = models.CharField(max_length=100)
    certificate_text = models.TextField()
    left_header = models.CharField(max_length=100)
    center_header = models.CharField(max_length=100)
    right_header = models.CharField(max_length=100)
    left_footer = models.CharField(max_length=100)
    right_footer = models.CharField(max_length=100)
    center_footer = models.CharField(max_length=100)
    background_image = models.CharField(max_length=100, blank=True, null=True)
    created_for = models.IntegerField()
    status = models.IntegerField()
    header_height = models.IntegerField()
    content_height = models.IntegerField()
    footer_height = models.IntegerField()
    content_width = models.IntegerField()
    enable_student_image = models.IntegerField()
    enable_image_height = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "certificates"

    def __str__(self):
        return f"Certificates {self.pk}"
