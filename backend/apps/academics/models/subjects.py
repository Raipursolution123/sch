from django.db import models


class Subjects(models.Model):
    """Maps to `subjects` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    code = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    linked_class = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "subjects"

    def __str__(self):
        return f"Subjects {self.pk}"
