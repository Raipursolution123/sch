from django.db import models


class CycHostelRoomBed(models.Model):
    """Maps to `cyc_hostel_room_bed` in db_current."""

    id = models.AutoField(primary_key=True)
    hostel_id = models.IntegerField()
    room_id = models.IntegerField(blank=True, null=True)
    room_number = models.CharField(max_length=44)
    bed_code = models.CharField(max_length=44)
    bed_status = models.IntegerField(default=1)

    class Meta:
        managed = False
        db_table = "cyc_hostel_room_bed"

    def __str__(self):
        return f"CycHostelRoomBed {self.pk}"
