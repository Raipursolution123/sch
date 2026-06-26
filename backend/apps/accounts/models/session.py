from django.db import models


class UserAuthentication(models.Model):
    """Maps to existing `users_authentication` table in db_current."""

    id = models.AutoField(primary_key=True)
    users_id = models.IntegerField()
    token = models.CharField(max_length=255)
    staff_id = models.IntegerField(blank=True, null=True)
    expired_at = models.DateTimeField()
    created_at = models.DateField(blank=True, null=True)
    updated_at = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "users_authentication"
        verbose_name = "user authentication token"
        verbose_name_plural = "user authentication tokens"

    def __str__(self):
        return f"user={self.users_id}"


class UserLog(models.Model):
    """Maps to existing `userlog` table in db_current."""

    id = models.AutoField(primary_key=True)
    user = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    class_section_id = models.IntegerField(blank=True, null=True)
    ipaddress = models.CharField(max_length=100, blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    login_datetime = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "userlog"
        verbose_name = "user log"
        verbose_name_plural = "user logs"

    def __str__(self):
        return f"{self.user} @ {self.login_datetime}"
