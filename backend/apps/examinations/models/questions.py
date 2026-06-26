from django.db import models


class Questions(models.Model):
    """Maps to `questions` in db_current."""

    id = models.AutoField(primary_key=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    lesson_id = models.IntegerField(blank=True, null=True)
    lesson_name = models.CharField(max_length=255, blank=True, null=True)
    question_type = models.CharField(max_length=100)
    level = models.CharField(max_length=10)
    class_id = models.IntegerField(blank=False, null=False, db_index=True)
    section_id = models.IntegerField(blank=True, null=True, db_index=True)
    class_section_id = models.IntegerField(blank=True, null=True, db_index=True)
    question_parts = models.TextField(blank=True, null=True)
    question = models.TextField(blank=True, null=True)
    opt_a = models.TextField(blank=True, null=True)
    opt_b = models.TextField(blank=True, null=True)
    opt_c = models.TextField(blank=True, null=True)
    opt_d = models.TextField(blank=True, null=True)
    opt_e = models.TextField(blank=True, null=True)
    correct = models.TextField(blank=True, null=True)
    qscore = models.IntegerField(blank=True, null=True)
    descriptive_word_limit = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)
    qpart_1 = models.IntegerField()
    qpart_2 = models.IntegerField()
    qpart_3 = models.IntegerField()
    qpart_4 = models.IntegerField()
    qpart_5 = models.IntegerField()
    is_it_offline = models.IntegerField()

    class Meta:
        managed = False
        db_table = "questions"

    def __str__(self):
        return f"Questions {self.pk}"
