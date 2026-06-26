from django.db import models


class Staff(models.Model):
    """Maps to `staff` in db_current."""

    id = models.AutoField(primary_key=True)
    employee_id = models.CharField(max_length=200, db_index=True)
    lang_id = models.IntegerField()
    currency_id = models.IntegerField(blank=True, null=True, default=0)
    department = models.IntegerField(blank=True, null=True, db_index=True)
    designation = models.IntegerField(blank=True, null=True, db_index=True)
    qualification = models.CharField(max_length=200)
    work_exp = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    surname = models.CharField(max_length=200)
    father_name = models.CharField(max_length=200)
    mother_name = models.CharField(max_length=200)
    contact_no = models.CharField(max_length=200)
    emergency_contact_no = models.CharField(max_length=200)
    email = models.CharField(max_length=200)
    dob = models.DateField()
    marital_status = models.CharField(max_length=100)
    date_of_joining = models.DateField(blank=True, null=True)
    date_of_leaving = models.DateField(blank=True, null=True)
    local_address = models.CharField(max_length=300)
    permanent_address = models.CharField(max_length=200)
    note = models.CharField(max_length=200)
    image = models.CharField(max_length=200)
    password = models.CharField(max_length=250)
    gender = models.CharField(max_length=50)
    account_title = models.CharField(max_length=200)
    bank_account_no = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=200)
    ifsc_code = models.CharField(max_length=200)
    bank_branch = models.CharField(max_length=100)
    payscale = models.CharField(max_length=200)
    basic_salary = models.IntegerField(blank=True, null=True)
    epf_no = models.CharField(max_length=200)
    contract_type = models.CharField(max_length=100)
    shift = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    facebook = models.CharField(max_length=200)
    twitter = models.CharField(max_length=200)
    linkedin = models.CharField(max_length=200)
    instagram = models.CharField(max_length=200)
    resume = models.CharField(max_length=200)
    joining_letter = models.CharField(max_length=200)
    resignation_letter = models.CharField(max_length=200)
    other_document_name = models.CharField(max_length=200)
    other_document_file = models.CharField(max_length=200)
    user_id = models.IntegerField()
    is_active = models.IntegerField()
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
