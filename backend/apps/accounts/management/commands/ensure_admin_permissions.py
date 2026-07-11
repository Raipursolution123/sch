from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import PermissionCategory, Role, RolePermission

# School Admin must manage sessions and general settings at school level.
ADMIN_ROLE_NAMES = ("ADMIN", "Admin")
SCHOOL_ADMIN_CATEGORIES = {
    "general_setting": {"can_view": 1, "can_add": 0, "can_edit": 1, "can_delete": 0},
    "session_setting": {"can_view": 1, "can_add": 1, "can_edit": 1, "can_delete": 0},
}


class Command(BaseCommand):
    help = (
        "Ensure School Admin role has session and general settings privileges "
        "(idempotent; safe for staging/production)."
    )

    def handle(self, *args, **options):
        role = Role.objects.filter(
            Q(name__in=ADMIN_ROLE_NAMES) | Q(slug__in=ADMIN_ROLE_NAMES)
        ).first()
        if role is None:
            self.stderr.write(self.style.ERROR("ADMIN role not found."))
            return

        created = 0
        updated = 0
        now = timezone.now()

        for short_code, flags in SCHOOL_ADMIN_CATEGORIES.items():
            category = PermissionCategory.objects.filter(short_code=short_code).first()
            if category is None:
                self.stderr.write(
                    self.style.WARNING(
                        f"Permission category '{short_code}' not found; skipped."
                    )
                )
                continue

            role_perm, was_created = RolePermission.objects.get_or_create(
                role=role,
                permission_category=category,
                defaults={**flags, "created_at": now},
            )
            if was_created:
                created += 1
                continue

            changed = False
            for field, value in flags.items():
                if getattr(role_perm, field) != value:
                    setattr(role_perm, field, value)
                    changed = True
            if changed:
                role_perm.save(update_fields=list(flags.keys()))
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"ADMIN role permissions ensured (created={created}, updated={updated})."
            )
        )
