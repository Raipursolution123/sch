from django.db import models


class ChatUsers(models.Model):
    """Maps to `chat_users` in db_current."""

    id = models.AutoField(primary_key=True)
    user_type = models.CharField(max_length=20, blank=True, null=True)
    staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    student_id = models.IntegerField(blank=True, null=True, db_index=True)
    create_staff_id = models.IntegerField(blank=True, null=True, db_index=True)
    create_student_id = models.IntegerField(blank=True, null=True, db_index=True)
    is_active = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "chat_users"

    def __str__(self):
        return f"ChatUsers {self.pk}"
