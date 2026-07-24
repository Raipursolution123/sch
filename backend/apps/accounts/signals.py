from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.accounts.models import RolePermission, StaffRole, User
from common.cache.reference_cache import invalidate_user_permissions_cache


def _user_ids_for_role(role_id: int | None) -> list[int]:
    if not role_id:
        return []
    staff_ids = StaffRole.objects.filter(role_id=role_id, is_active=1).values_list(
        "staff_id", flat=True
    )
    return list(
        User.objects.filter(user_id__in=staff_ids, role="staff").values_list(
            "id", flat=True
        )
    )


def _invalidate_users_for_role(role_id: int | None) -> None:
    for user_id in _user_ids_for_role(role_id):
        invalidate_user_permissions_cache(user_id)


@receiver(post_save, sender=RolePermission)
@receiver(post_delete, sender=RolePermission)
def invalidate_on_role_permission_change(sender, instance, **kwargs):
    _invalidate_users_for_role(instance.role_id)


@receiver(post_save, sender=StaffRole)
@receiver(post_delete, sender=StaffRole)
def invalidate_on_staff_role_change(sender, instance, **kwargs):
    _invalidate_users_for_role(instance.role_id)
