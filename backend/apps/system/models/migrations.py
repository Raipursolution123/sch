from django.db import models


class Migrations(models.Model):
    """Maps to `migrations` in db_current."""

    version = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = "migrations"

    def __str__(self):
        return f"Migrations {self.pk}"
