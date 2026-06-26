from django.db import models


class CourseRating(models.Model):
    """Maps to `course_rating` in db_current."""

    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField(blank=True, null=True)
    guest_id = models.IntegerField(blank=True, null=True)
    course_id = models.IntegerField(db_index=True)
    rating = models.CharField(max_length=200)
    review = models.TextField()
    date = models.DateField()

    class Meta:
        managed = False
        db_table = "course_rating"

    def __str__(self):
        return f"CourseRating {self.pk}"
