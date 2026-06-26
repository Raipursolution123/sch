from django.db import models


class FrontCmsMediaGallery(models.Model):
    """Maps to `front_cms_media_gallery` in db_current."""

    id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=255, blank=True, null=True)
    image = models.CharField(max_length=300, blank=True, null=True)
    thumb_path = models.CharField(max_length=300, blank=True, null=True)
    dir_path = models.CharField(max_length=300, blank=True, null=True)
    img_name = models.CharField(max_length=300, blank=True, null=True)
    thumb_name = models.CharField(max_length=300, blank=True, null=True)
    created_at = models.DateTimeField()
    file_type = models.CharField(max_length=100)
    file_size = models.CharField(max_length=100)
    vid_url = models.TextField()
    vid_title = models.CharField(max_length=250)
    is_it_award = models.IntegerField()
    is_it_form = models.IntegerField()
    is_it_notice = models.IntegerField()
    is_it_order = models.IntegerField()
    is_it_report = models.IntegerField()
    content_description = models.TextField()

    class Meta:
        managed = False
        db_table = "front_cms_media_gallery"

    def __str__(self):
        return f"FrontCmsMediaGallery {self.pk}"
