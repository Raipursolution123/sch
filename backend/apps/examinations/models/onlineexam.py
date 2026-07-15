from django.db import models


class Onlineexam(models.Model):
    """Maps to `onlineexam` in db_current."""

    id = models.AutoField(primary_key=True)
    session_id = models.IntegerField(blank=True, null=True, db_index=True)
    exam = models.TextField(blank=True, null=True)
    attempt = models.IntegerField()
    exam_from = models.DateTimeField(blank=True, null=True)
    exam_to = models.DateTimeField(blank=True, null=True)
    is_quiz = models.IntegerField(default=0)
    auto_publish_date = models.DateTimeField(blank=True, null=True)
    time_from = models.TimeField(blank=True, null=True)
    time_to = models.TimeField(blank=True, null=True)
    duration = models.TimeField()
    passing_percentage = models.TextField(default=0)
    description = models.TextField(blank=True, null=True)
    publish_result = models.IntegerField(default=0)
    answer_word_count = models.IntegerField(default="-1")
    is_active = models.CharField(max_length=1, blank=True, null=True, default=0)
    is_marks_display = models.IntegerField(default=0)
    is_neg_marking = models.IntegerField(default=0)
    is_random_question = models.IntegerField(default=0)
    is_rank_generated = models.IntegerField(default=0)
    publish_exam_notification = models.IntegerField()
    publish_result_notification = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "onlineexam"

    def __str__(self):
        return f"Onlineexam {self.pk}"
