from django.db import models


class ChatConnections(models.Model):
    """Maps to `chat_connections` in db_current."""

    id = models.AutoField(primary_key=True)
    chat_user_one = models.IntegerField(blank=False, null=False, db_index=True)
    chat_user_two = models.IntegerField(blank=False, null=False, db_index=True)
    ip = models.CharField(max_length=30, blank=True, null=True)
    time = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "chat_connections"

    def __str__(self):
        return f"ChatConnections {self.pk}"
