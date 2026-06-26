from django.db import models


class UploadContents(models.Model):
    """Maps to `upload_contents` in db_current."""

    id = models.AutoField(primary_key=True)
    content_type_id = models.IntegerField(blank=False, null=False, db_index=True)
    class_id = models.IntegerField(blank=True, null=True)
    section_id = models.IntegerField(blank=True, null=True)
    subject_id = models.IntegerField(blank=True, null=True)
    lesson_id = models.IntegerField(blank=True, null=True)
    image = models.CharField(max_length=300, blank=True, null=True)
    thumb_path = models.CharField(max_length=300, blank=True, null=True)
    dir_path = models.CharField(max_length=300, blank=True, null=True)
    real_name = models.TextField()
    img_name = models.CharField(max_length=300, blank=True, null=True)
    thumb_name = models.CharField(max_length=300, blank=True, null=True)
    file_type = models.CharField(max_length=100)
    mime_type = models.TextField()
    file_size = models.CharField(max_length=100)
    vid_url = models.TextField()
    vid_title = models.CharField(max_length=250)
    upload_by = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "upload_contents"

    def __str__(self):
        return f"UploadContents {self.pk}"
