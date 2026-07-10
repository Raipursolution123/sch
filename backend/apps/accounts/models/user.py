from django.db import models

from apps.accounts.managers import UserManager


class User(models.Model):
    """
    Maps to existing `users` table in db_current.
    Schema source of truth: db_current (not Django migrations).
    """

    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    username = models.CharField(max_length=50, blank=True, null=True)
    password = models.CharField(max_length=50, blank=True, null=True)
    childs = models.TextField()
    role = models.CharField(max_length=30)
    lang_id = models.IntegerField()
    currency_id = models.IntegerField(blank=True, null=True, default=0)
    verification_code = models.CharField(max_length=200)
    is_active = models.CharField(max_length=255, blank=True, null=True, default="yes")
    created_at = models.DateTimeField()
    updated_at = models.DateField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    class Meta:
        managed = False
        db_table = "users"
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self):
        return self.username or str(self.id)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_username(self):
        return self.username or ""

    def check_password(self, raw_password):
        from apps.accounts.services.legacy_password import verify_legacy_password

        return verify_legacy_password(raw_password, self.password)

    def set_password(self, raw_password):
        from apps.accounts.services.legacy_password import hash_legacy_password

        self.password = hash_legacy_password(raw_password)

    @property
    def is_active_user(self):
        return str(self.is_active or "").lower() in {"yes", "1", "true"}

    @property
    def is_staff(self):
        return self.role not in {"student", "parent"}

    @property
    def is_superadmin(self):
        from django.db.models import Q

        from apps.accounts.models.role import Role, StaffRole

        if self.role == "staff":
            return StaffRole.objects.filter(
                staff_id=self.user_id,
                role__is_superadmin=1,
                is_active=1,
            ).exists()

        return Role.objects.filter(
            Q(slug=self.role) | Q(name=self.role), is_superadmin=1
        ).exists()

    @property
    def role_slug(self):
        if self.role == "staff":
            from apps.accounts.models.role import StaffRole

            staff_role = (
                StaffRole.objects.filter(staff_id=self.user_id, is_active=1)
                .select_related("role")
                .first()
            )
            if staff_role and staff_role.role:
                return staff_role.role.slug or staff_role.role.name or self.role
        return self.role
