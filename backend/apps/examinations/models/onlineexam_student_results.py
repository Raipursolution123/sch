from django.db import models


class OnlineexamStudentResults(models.Model):
    """Maps to `onlineexam_student_results` in db_current."""

    id = models.AutoField(primary_key=True)
    onlineexam_student_id = models.IntegerField(blank=False, null=False, db_index=True)
    onlineexam_question_id = models.IntegerField(blank=False, null=False, db_index=True)
    select_option = models.TextField(blank=True, null=True)
    marks = models.FloatField(default=0.00)
    remark = models.TextField(blank=True, null=True)
    attachment_name = models.TextField(blank=True, null=True)
    attachment_upload_name = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "onlineexam_student_results"

    def __str__(self):
        return f"OnlineexamStudentResults {self.pk}"
