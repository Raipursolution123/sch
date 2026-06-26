from django.db import models


class ChatMessages(models.Model):
    """Maps to `chat_messages` in db_current."""

    id = models.AutoField(primary_key=True)
    message = models.TextField(blank=True, null=True)
    chat_user_id = models.IntegerField(blank=False, null=False, db_index=True)
    ip = models.CharField(max_length=30)
    time = models.IntegerField()
    is_first = models.IntegerField(blank=True, null=True, default=0)
    is_read = models.IntegerField(default=0)
    chat_connection_id = models.IntegerField(blank=False, null=False, db_index=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "chat_messages"

    def __str__(self):
        return f"ChatMessages {self.pk}"
