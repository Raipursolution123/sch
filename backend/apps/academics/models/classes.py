from django.db import models


class Classes(models.Model):
    """Maps to `classes` in db_current."""

    id = models.AutoField(primary_key=True)
    class_field = models.CharField(max_length=60, blank=True, null=True, db_column='class')
    sort_order = models.IntegerField(default=9999)
    is_hedu_program = models.CharField(max_length=10, blank=True, null=True)
    is_active = models.CharField(max_length=255, blank=True, null=True, default='no')
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "classes"

    def __str__(self):
        return f"Classes {self.pk}"
