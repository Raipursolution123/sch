from django.db import models


class FrontCmsPageContents(models.Model):
    """Maps to `front_cms_page_contents` in db_current."""

    id = models.AutoField(primary_key=True)
    page_id = models.IntegerField(blank=True, null=True, db_index=True)
    content_type = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "front_cms_page_contents"

    def __str__(self):
        return f"FrontCmsPageContents {self.pk}"
