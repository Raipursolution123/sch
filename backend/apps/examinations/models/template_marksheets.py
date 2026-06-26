from django.db import models


class TemplateMarksheets(models.Model):
    """Maps to `template_marksheets` in db_current."""

    id = models.AutoField(primary_key=True)
    header_image = models.CharField(max_length=200, blank=True, null=True)
    template = models.CharField(max_length=200, blank=True, null=True)
    heading = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    left_logo = models.CharField(max_length=200, blank=True, null=True)
    right_logo = models.CharField(max_length=200, blank=True, null=True)
    exam_name = models.CharField(max_length=200, blank=True, null=True)
    school_name = models.CharField(max_length=200, blank=True, null=True)
    exam_center = models.CharField(max_length=200, blank=True, null=True)
    left_sign = models.CharField(max_length=200, blank=True, null=True)
    middle_sign = models.CharField(max_length=200, blank=True, null=True)
    right_sign = models.CharField(max_length=200, blank=True, null=True)
    exam_session = models.IntegerField(blank=True, null=True, default=1)
    is_name = models.IntegerField(blank=True, null=True, default=1)
    is_father_name = models.IntegerField(blank=True, null=True, default=1)
    is_mother_name = models.IntegerField(blank=True, null=True, default=1)
    is_dob = models.IntegerField(blank=True, null=True, default=1)
    is_admission_no = models.IntegerField(blank=True, null=True, default=1)
    is_roll_no = models.IntegerField(blank=True, null=True, default=1)
    is_photo = models.IntegerField(blank=True, null=True, default=1)
    is_division = models.IntegerField(default=1)
    is_rank = models.IntegerField(default=0)
    is_customfield = models.IntegerField()
    background_img = models.CharField(max_length=200, blank=True, null=True)
    date = models.CharField(max_length=20, blank=True, null=True)
    is_class = models.IntegerField(default=0)
    is_teacher_remark = models.IntegerField(default=1)
    is_section = models.IntegerField(default=0)
    content = models.TextField(blank=True, null=True)
    content_footer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "template_marksheets"

    def __str__(self):
        return f"TemplateMarksheets {self.pk}"
