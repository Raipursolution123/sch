from django.db import models


class CycLeads(models.Model):
    """Maps to `cyc_leads` in db_current."""

    l_id = models.AutoField(primary_key=True)
    c_id = models.IntegerField()
    is_student_admitted = models.IntegerField()
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    l_name = models.CharField(max_length=255)
    l_father_name = models.CharField(max_length=255)
    l_class = models.CharField(max_length=44)
    l_address = models.TextField()
    l_phone_number = models.CharField(max_length=255)
    l_taken_status = models.IntegerField(default=0)
    taken_by = models.IntegerField(blank=True, null=True)
    current_agent = models.IntegerField(blank=True, null=True)
    l_reverse_status = models.IntegerField(default=0)
    l_taken_data = models.TextField(blank=True, null=True)
    l_reverse_data = models.TextField(blank=True, null=True)
    l_follow_up_data = models.TextField(blank=True, null=True)
    l_status = models.CharField(max_length=255, default='Open')
    is_closed = models.IntegerField(default=0)
    closed_date = models.DateField()
    closed_by = models.IntegerField(blank=True, null=True)
    l_manager = models.IntegerField()
    l_manager_data = models.TextField(blank=True, null=True)
    l_date = models.DateField()
    l_mother_name = models.CharField(max_length=255, blank=True, null=True)
    l_location = models.CharField(max_length=255, blank=True, null=True)
    l_qualification = models.CharField(max_length=255, blank=True, null=True)
    l_alternative_phone = models.CharField(max_length=255, blank=True, null=True)
    l_email = models.CharField(max_length=255, blank=True, null=True)
    l_source = models.CharField(max_length=255, blank=True, null=True)
    l_resources = models.CharField(max_length=100, blank=True, null=True)
    individual_status = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "cyc_leads"

    def __str__(self):
        return f"CycLeads {self.pk}"
