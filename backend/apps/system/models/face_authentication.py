from django.db import models


class FaceAuthentication(models.Model):
    """Maps to `face_authentication` in db_current."""

    fa_id = models.AutoField(primary_key=True)
    id = models.IntegerField()
    image = models.TextField()
    belong_to = models.CharField(max_length=44)
    face_features = models.TextField()

    class Meta:
        managed = False
        db_table = "face_authentication"

    def __str__(self):
        return f"FaceAuthentication {self.pk}"
