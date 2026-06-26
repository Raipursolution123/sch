from django.db import models


class VideoTutorial(models.Model):
    """Maps to `video_tutorial` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    vid_title = models.TextField(blank=True, null=True)
    description = models.TextField()
    thumb_path = models.CharField(max_length=500, blank=True, null=True)
    dir_path = models.CharField(max_length=500, blank=True, null=True)
    img_name = models.CharField(max_length=300)
    thumb_name = models.CharField(max_length=300)
    video_link = models.CharField(max_length=100)
    created_by = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "video_tutorial"

    def __str__(self):
        return f"VideoTutorial {self.pk}"
