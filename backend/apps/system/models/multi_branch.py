from django.db import models


class MultiBranch(models.Model):
    """Maps to `multi_branch` in db_current."""

    id = models.AutoField(primary_key=True)
    branch_name = models.CharField(max_length=200, blank=True, null=True)
    branch_url = models.CharField(max_length=500)
    hostname = models.CharField(max_length=200, blank=True, null=True)
    username = models.CharField(max_length=200, blank=True, null=True)
    password = models.CharField(max_length=200, blank=True, null=True)
    database_name = models.CharField(max_length=200, blank=True, null=True)
    directory_path = models.CharField(max_length=500, blank=True, null=True)
    is_verified = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "multi_branch"

    def __str__(self):
        return f"MultiBranch {self.pk}"
