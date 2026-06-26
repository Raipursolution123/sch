from django.db import models


class Books(models.Model):
    """Maps to `books` in db_current."""

    id = models.AutoField(primary_key=True)
    book_title = models.CharField(max_length=100)
    book_no = models.CharField(max_length=50)
    isbn_no = models.CharField(max_length=100)
    subject = models.CharField(max_length=100, blank=True, null=True)
    claases = models.CharField(max_length=44, blank=True, null=True)
    category = models.CharField(max_length=255, blank=True, null=True)
    rack_no = models.CharField(max_length=100)
    publish = models.CharField(max_length=100, blank=True, null=True)
    author = models.CharField(max_length=100, blank=True, null=True)
    qty = models.IntegerField(blank=True, null=True)
    perunitcost = models.FloatField(blank=True, null=True)
    postdate = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    available = models.CharField(max_length=10, blank=True, null=True, default='yes')
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "books"

    def __str__(self):
        return f"Books {self.pk}"
