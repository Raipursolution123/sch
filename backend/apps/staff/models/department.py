from django.db import models


class Department(models.Model):
    """Maps to `department` in db_current."""

    id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=200)
    is_active = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "department"

    def __str__(self):
        return f"Department {self.pk}"
