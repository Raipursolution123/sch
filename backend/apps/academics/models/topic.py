from django.db import models


class Topic(models.Model):
    """Maps to `topic` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    lesson_id = models.IntegerField(blank=False, null=False, db_index=True)
    name = models.CharField(max_length=255)
    status = models.IntegerField()
    complete_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "topic"

    def __str__(self):
        return f"Topic {self.pk}"
