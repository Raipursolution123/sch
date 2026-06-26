from django.db import models


class HostelRooms(models.Model):
    """Maps to `hostel_rooms` in db_current."""

    id = models.AutoField(primary_key=True)
    hostel_id = models.IntegerField(blank=True, null=True, db_index=True)
    room_type_id = models.IntegerField(blank=True, null=True, db_index=True)
    room_no = models.CharField(max_length=200, blank=True, null=True)
    no_of_bed = models.IntegerField(blank=True, null=True)
    cost_per_bed = models.FloatField(blank=True, null=True, default=0.00)
    cost_term = models.CharField(max_length=44)
    title = models.CharField(max_length=200, blank=True, null=True)
    fee_title = models.CharField(max_length=44, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "hostel_rooms"

    def __str__(self):
        return f"HostelRooms {self.pk}"
