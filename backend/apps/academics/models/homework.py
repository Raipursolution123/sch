from django.db import models


class Homework(models.Model):
    """Maps to `homework` in db_current."""

    id = models.AutoField(primary_key=True)
    class_id = models.IntegerField(blank=False, null=False, db_index=True)
    section_id = models.IntegerField(blank=False, null=False, db_index=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    staff_id = models.IntegerField(blank=False, null=False, db_index=True)
    subject_group_subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    subject_id = models.IntegerField(blank=True, null=True, db_index=True)
    homework_date = models.DateField()
    submit_date = models.DateField()
    marks = models.FloatField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    assigned_to_house = models.IntegerField(blank=True, null=True)
    assigned_to_president = models.IntegerField(blank=True, null=True)
    create_date = models.DateField()
    evaluation_date = models.DateField(blank=True, null=True)
    document = models.CharField(max_length=200, blank=True, null=True)
    created_by = models.IntegerField(blank=False, null=False, db_index=True)
    evaluated_by = models.IntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "homework"

    def __str__(self):
        return f"Homework {self.pk}"
