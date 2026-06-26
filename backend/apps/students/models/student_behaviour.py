from django.db import models


class StudentBehaviour(models.Model):
    """Maps to `student_behaviour` in db_current."""

    id = models.AutoField(primary_key=True)
    point = models.IntegerField()
    description = models.TextField()
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "student_behaviour"

    def __str__(self):
        return f"StudentBehaviour {self.pk}"
