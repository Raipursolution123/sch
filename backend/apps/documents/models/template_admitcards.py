from django.db import models


class TemplateAdmitcards(models.Model):
    """Maps to `template_admitcards` in db_current."""

    id = models.AutoField(primary_key=True)
    template = models.CharField(max_length=250, blank=True, null=True)
    heading = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    left_logo = models.CharField(max_length=200, blank=True, null=True)
    right_logo = models.CharField(max_length=200, blank=True, null=True)
    exam_name = models.CharField(max_length=200, blank=True, null=True)
    school_name = models.CharField(max_length=200, blank=True, null=True)
    exam_center = models.CharField(max_length=200, blank=True, null=True)
    sign = models.CharField(max_length=200, blank=True, null=True)
    background_img = models.CharField(max_length=200, blank=True, null=True)
    is_letter_head = models.IntegerField()
    is_name = models.IntegerField(default=1)
    is_father_name = models.IntegerField(default=1)
    is_mother_name = models.IntegerField(default=1)
    is_dob = models.IntegerField(default=1)
    is_admission_no = models.IntegerField(default=1)
    is_roll_no = models.IntegerField(default=1)
    is_address = models.IntegerField(default=1)
    is_gender = models.IntegerField(default=1)
    is_photo = models.IntegerField()
    is_class = models.IntegerField(default=0)
    is_section = models.IntegerField(default=0)
    content_footer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "template_admitcards"

    def __str__(self):
        return f"TemplateAdmitcards {self.pk}"
