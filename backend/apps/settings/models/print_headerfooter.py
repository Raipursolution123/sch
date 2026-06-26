from django.db import models


class PrintHeaderfooter(models.Model):
    """Maps to `print_headerfooter` in db_current."""

    id = models.AutoField(primary_key=True)
    print_type = models.CharField(max_length=255)
    header_image = models.CharField(max_length=255)
    footer_content = models.TextField()
    created_by = models.IntegerField()
    entry_date = models.DateTimeField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "print_headerfooter"

    def __str__(self):
        return f"PrintHeaderfooter {self.pk}"
