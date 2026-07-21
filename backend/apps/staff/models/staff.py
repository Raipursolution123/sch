from django.db import models


class Staff(models.Model):
    """Maps to `staff` in db_current."""

    id = models.AutoField(primary_key=True)
    employee_id = models.CharField(max_length=200, db_index=True, blank=True, null=True)
    lang_id = models.IntegerField(blank=True, null=True, default=1)
    currency_id = models.IntegerField(blank=True, null=True, default=0)
    department = models.IntegerField(blank=True, null=True, db_index=True)
    designation = models.IntegerField(blank=True, null=True, db_index=True)
    qualification = models.CharField(max_length=200, blank=True, null=True)
    work_exp = models.CharField(max_length=200, blank=True, null=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    surname = models.CharField(max_length=200, blank=True, null=True)
    father_name = models.CharField(max_length=200, blank=True, null=True)
    mother_name = models.CharField(max_length=200, blank=True, null=True)
    contact_no = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_no = models.CharField(max_length=200, blank=True, null=True)
    email = models.CharField(max_length=200, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    marital_status = models.CharField(max_length=100, blank=True, null=True)
    date_of_joining = models.DateField(blank=True, null=True)
    date_of_leaving = models.DateField(blank=True, null=True)
    local_address = models.CharField(max_length=300, blank=True, null=True)
    permanent_address = models.CharField(max_length=200, blank=True, null=True)
    note = models.CharField(max_length=200, blank=True, null=True)
    image = models.CharField(max_length=200, blank=True, null=True)
    password = models.CharField(max_length=250, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    account_title = models.CharField(max_length=200, blank=True, null=True)
    bank_account_no = models.CharField(max_length=200, blank=True, null=True)
    bank_name = models.CharField(max_length=200, blank=True, null=True)
    ifsc_code = models.CharField(max_length=200, blank=True, null=True)
    bank_branch = models.CharField(max_length=100, blank=True, null=True)
    payscale = models.CharField(max_length=200, blank=True, null=True)
    basic_salary = models.IntegerField(blank=True, null=True)
    epf_no = models.CharField(max_length=200, blank=True, null=True)
    contract_type = models.CharField(max_length=100, blank=True, null=True)
    shift = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    facebook = models.CharField(max_length=200, blank=True, null=True)
    twitter = models.CharField(max_length=200, blank=True, null=True)
    linkedin = models.CharField(max_length=200, blank=True, null=True)
    instagram = models.CharField(max_length=200, blank=True, null=True)
    resume = models.CharField(max_length=200, blank=True, null=True)
    joining_letter = models.CharField(max_length=200, blank=True, null=True)
    resignation_letter = models.CharField(max_length=200, blank=True, null=True)
    other_document_name = models.CharField(max_length=200, blank=True, null=True)
    other_document_file = models.CharField(max_length=200, blank=True, null=True)
    user_id = models.IntegerField(blank=True, null=True)
    is_active = models.IntegerField(blank=True, null=True, default=1)
    direct_manager = models.IntegerField(blank=True, null=True)
    is_house_incharge = models.IntegerField(default=0)
    verification_code = models.CharField(max_length=100)
    zoom_api_key = models.CharField(max_length=100, blank=True, null=True)
    zoom_api_secret = models.CharField(max_length=100, blank=True, null=True)
    biometric_device_id = models.CharField(max_length=255, blank=True, null=True)
    disable_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "staff"

    def __str__(self):
        return f"Staff {self.pk}"
