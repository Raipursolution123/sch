from django.db import models


class FrontCmsProgramPhotos(models.Model):
    """Maps to `front_cms_program_photos` in db_current."""

    id = models.AutoField(primary_key=True)
    program_id = models.IntegerField(blank=True, null=True, db_index=True)
    media_gallery_id = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "front_cms_program_photos"

    def __str__(self):
        return f"FrontCmsProgramPhotos {self.pk}"
