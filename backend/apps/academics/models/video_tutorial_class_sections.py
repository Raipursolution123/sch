from django.db import models


class VideoTutorialClassSections(models.Model):
    """Maps to `video_tutorial_class_sections` in db_current."""

    id = models.AutoField(primary_key=True)
    video_tutorial_id = models.IntegerField(blank=False, null=False, db_index=True)
    class_section_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_date = models.DateField()

    class Meta:
        managed = False
        db_table = "video_tutorial_class_sections"

    def __str__(self):
        return f"VideoTutorialClassSections {self.pk}"
