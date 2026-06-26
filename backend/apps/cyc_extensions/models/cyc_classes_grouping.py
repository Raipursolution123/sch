from django.db import models


class CycClassesGrouping(models.Model):
    """Maps to `cyc_classes_grouping` in db_current."""

    cg_id = models.AutoField(primary_key=True)
    group_id = models.CharField(max_length=100, db_index=True)
    class_id = models.IntegerField(blank=True, null=True, db_index=True)
    section_id = models.IntegerField(blank=True, null=True)
    class_section_id = models.IntegerField(blank=True, null=True)
    subject_group_id = models.IntegerField(blank=True, null=True)
    subject_id = models.IntegerField(blank=True, null=True)
    session_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = "cyc_classes_grouping"

    def __str__(self):
        return f"CycClassesGrouping {self.pk}"
