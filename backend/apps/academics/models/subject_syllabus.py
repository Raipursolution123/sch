from django.db import models


class SubjectSyllabus(models.Model):
    """Maps to `subject_syllabus` in db_current."""

    id = models.AutoField(primary_key=True)
    topic_id = models.IntegerField(blank=False, null=False, db_index=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_by = models.IntegerField(blank=False, null=False, db_index=True)
    created_for = models.IntegerField(blank=False, null=False, db_index=True)
    date = models.DateField()
    time_from = models.CharField(max_length=255)
    time_to = models.CharField(max_length=255)
    presentation = models.TextField()
    attachment = models.TextField()
    lacture_youtube_url = models.CharField(max_length=255)
    lacture_video = models.CharField(max_length=255)
    sub_topic = models.TextField()
    teaching_method = models.TextField()
    general_objectives = models.TextField()
    previous_knowledge = models.TextField()
    comprehensive_questions = models.TextField()
    status = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "subject_syllabus"

    def __str__(self):
        return f"SubjectSyllabus {self.pk}"
