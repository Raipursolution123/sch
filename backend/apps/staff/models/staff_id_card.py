from django.db import models


class StaffIdCard(models.Model):
    """Maps to `staff_id_card` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    school_name = models.CharField(max_length=255)
    school_address = models.CharField(max_length=255)
    background = models.CharField(max_length=100)
    logo = models.CharField(max_length=100)
    sign_image = models.CharField(max_length=100)
    header_color = models.CharField(max_length=100)
    enable_vertical_card = models.IntegerField(default=0)
    enable_staff_role = models.IntegerField()
    enable_staff_id = models.IntegerField()
    enable_staff_department = models.IntegerField()
    enable_designation = models.IntegerField()
    enable_name = models.IntegerField()
    enable_fathers_name = models.IntegerField()
    enable_mothers_name = models.IntegerField()
    enable_date_of_joining = models.IntegerField()
    enable_permanent_address = models.IntegerField()
    enable_staff_dob = models.IntegerField()
    enable_staff_phone = models.IntegerField()
    enable_staff_barcode = models.IntegerField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = "staff_id_card"

    def __str__(self):
        return f"StaffIdCard {self.pk}"
