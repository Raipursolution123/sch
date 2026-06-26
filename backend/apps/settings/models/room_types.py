from django.db import models


class RoomTypes(models.Model):
    """Maps to `room_types` in db_current."""

    id = models.AutoField(primary_key=True)
    room_type = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "room_types"

    def __str__(self):
        return f"RoomTypes {self.pk}"
