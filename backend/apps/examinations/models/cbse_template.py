from django.db import models


class CbseTemplate(models.Model):
    """Maps to `cbse_template` in db_current."""

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, blank=True, null=True, db_index=True)
    orientation = models.CharField(max_length=1, default="P")
    description = models.CharField(max_length=255)
    gradeexam_id = models.IntegerField(blank=True, null=True, db_index=True)
    remarkexam_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_weightage = models.CharField(max_length=10)
    marksheet_type = models.CharField(max_length=50, db_index=True)
    created_by = models.IntegerField()
    header_image = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    left_logo = models.CharField(max_length=200, blank=True, null=True)
    right_logo = models.CharField(max_length=200, blank=True, null=True)
    exam_name = models.CharField(max_length=200, blank=True, null=True, db_index=True)
    school_name = models.CharField(max_length=200, blank=True, null=True, db_index=True)
    exam_center = models.CharField(max_length=200, blank=True, null=True)
    session_id = models.IntegerField(blank=False, null=False, db_index=True)
    left_sign = models.CharField(max_length=200, blank=True, null=True)
    middle_sign = models.CharField(max_length=200, blank=True, null=True)
    right_sign = models.CharField(max_length=200, blank=True, null=True)
    background_img = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    content_footer = models.TextField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    is_name = models.IntegerField(blank=True, null=True, default=1)
    is_father_name = models.IntegerField(blank=True, null=True, default=1)
    is_mother_name = models.IntegerField(blank=True, null=True, default=1)
    exam_session = models.IntegerField(blank=True, null=True, default=1)
    is_admission_no = models.IntegerField(blank=True, null=True, default=1)
    is_division = models.IntegerField(default=1)
    is_roll_no = models.IntegerField(blank=True, null=True, default=1)
    is_photo = models.IntegerField(blank=True, null=True, default=1)
    is_class = models.IntegerField(default=0)
    is_section = models.IntegerField(default=0)
    is_dob = models.IntegerField(blank=True, null=True, default=1)
    is_remark = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = "cbse_template"

    def __str__(self):
        return f"CbseTemplate {self.pk}"
