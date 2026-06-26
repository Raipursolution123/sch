from django.db import models


class IdCard(models.Model):
    """Maps to `id_card` in db_current."""

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    school_name = models.CharField(max_length=100)
    school_address = models.CharField(max_length=500)
    background = models.CharField(max_length=100)
    logo = models.CharField(max_length=100)
    sign_image = models.CharField(max_length=100)
    enable_vertical_card = models.IntegerField(default=0)
    header_color = models.CharField(max_length=100)
    enable_admission_no = models.IntegerField()
    enable_student_name = models.IntegerField()
    enable_class = models.IntegerField()
    enable_fathers_name = models.IntegerField()
    enable_mothers_name = models.IntegerField()
    enable_address = models.IntegerField()
    enable_phone = models.IntegerField()
    enable_dob = models.IntegerField()
    enable_blood_group = models.IntegerField()
    enable_student_barcode = models.IntegerField(default=1)
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = "id_card"

    def __str__(self):
        return f"IdCard {self.pk}"
