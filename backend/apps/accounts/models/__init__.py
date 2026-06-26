from apps.accounts.models.permission import (
    PermissionCategory,
    PermissionGroup,
    PermissionStudent,
)
from apps.accounts.models.role import Role, RolePermission, StaffRole
from apps.accounts.models.session import UserAuthentication, UserLog
from apps.accounts.models.user import User

try:
    from apps.accounts.models.captcha import Captcha
except ImportError:
    Captcha = None  # type: ignore[misc, assignment]

try:
    from apps.accounts.models.notification_roles import NotificationRoles
except ImportError:
    NotificationRoles = None  # type: ignore[misc, assignment]

__all__ = [
    "PermissionCategory",
    "PermissionGroup",
    "PermissionStudent",
    "Role",
    "RolePermission",
    "StaffRole",
    "User",
    "UserAuthentication",
    "UserLog",
]
if Captcha is not None:
    __all__.append("Captcha")
if NotificationRoles is not None:
    __all__.append("NotificationRoles")
