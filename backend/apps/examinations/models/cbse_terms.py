from django.db import models


class CbseTerms(models.Model):
    """Maps to `cbse_terms` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    term_code = models.CharField(max_length=100, db_index=True)
    description = models.TextField()
    created_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "cbse_terms"

    def __str__(self):
        return f"CbseTerms {self.pk}"
