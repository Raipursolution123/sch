from django.contrib.auth.backends import ModelBackend

from apps.accounts.models import User
from apps.accounts.services.legacy_password import verify_legacy_password


class UsernameBackend(ModelBackend):
    """
    Authenticate against legacy `users` table.

    Legacy ERP disambiguates non-unique usernames using username + password + role.
    Session tokens (`users_authentication`) are keyed by users.id after login.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        role = kwargs.get("role")
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        if username is None or password is None:
            return None

        qs = User.objects.filter(username=username)
        if role:
            qs = qs.filter(role=role)

        for user in qs:
            if verify_legacy_password(password, user.password) and user.is_active_user:
                return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def user_can_authenticate(self, user):
        return user.is_active_user
