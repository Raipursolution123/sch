from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = False

    def get_by_natural_key(self, username):
        return self.get(**{f"{self.model.USERNAME_FIELD}__iexact": username})

    def create_user(self, username, password=None, **extra_fields):
        raise NotImplementedError(
            "User creation must use the legacy ERP workflow against db_current."
        )

    def create_superuser(self, username, password=None, **extra_fields):
        raise NotImplementedError(
            "Superuser creation must use the legacy ERP workflow against db_current."
        )
