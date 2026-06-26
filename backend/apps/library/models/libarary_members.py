from django.db import models


class LibararyMembers(models.Model):
    """Maps to `libarary_members` in db_current."""

    id = models.AutoField(primary_key=True)
    library_card_no = models.CharField(max_length=50, blank=True, null=True)
    member_type = models.CharField(max_length=50, blank=True, null=True)
    member_id = models.IntegerField(blank=True, null=True)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "libarary_members"

    def __str__(self):
        return f"LibararyMembers {self.pk}"
