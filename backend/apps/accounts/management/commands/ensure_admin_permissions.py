from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from apps.accounts.models import PermissionCategory, Role, RolePermission, StaffRole
from apps.staff.models import Staff

# School Admin must manage sessions and general settings at school level.
ADMIN_ROLE_NAMES = ("ADMIN", "Admin")
SUPER_ADMIN_ROLE_NAMES = ("Super Admin",)
DEFAULT_SCHOOL_ADMIN_EMAILS = ("admin@demo.com",)
INITIAL_SETUP_EMPLOYEE_ID = "9000"
SCHOOL_ADMIN_CATEGORIES = {
    "general_setting": {"can_view": 1, "can_add": 0, "can_edit": 1, "can_delete": 0},
    "session_setting": {"can_view": 1, "can_add": 1, "can_edit": 1, "can_delete": 0},
}


class Command(BaseCommand):
    help = (
        "Ensure School Admin role permissions and staff role links "
        "(idempotent; safe for staging/production)."
    )

    def handle(self, *args, **options):
        admin_role = Role.objects.filter(
            Q(name__in=ADMIN_ROLE_NAMES) | Q(slug__in=ADMIN_ROLE_NAMES)
        ).first()
        if admin_role is None:
            self.stderr.write(self.style.ERROR("ADMIN role not found."))
            return

        super_admin_role = Role.objects.filter(
            Q(name__in=SUPER_ADMIN_ROLE_NAMES)
            | Q(slug__in=SUPER_ADMIN_ROLE_NAMES)
            | Q(is_superadmin=1)
        ).first()

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
                role=admin_role,
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

        role_links_created = self._ensure_school_admin_staff_roles(
            admin_role=admin_role,
            super_admin_role=super_admin_role,
            now=now,
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"School admin staff role links ensured (created={role_links_created})."
            )
        )

    def _ensure_school_admin_staff_roles(self, *, admin_role, super_admin_role, now):
        created = 0
        candidates = Staff.objects.filter(is_active=1).filter(
            Q(email__in=DEFAULT_SCHOOL_ADMIN_EMAILS)
            | Q(employee_id=INITIAL_SETUP_EMPLOYEE_ID)
        )

        for staff in candidates.distinct():
            has_active_role = StaffRole.objects.filter(
                staff_id=staff.id, is_active=1
            ).exists()
            if has_active_role:
                continue

            target_role = super_admin_role or admin_role
            if target_role is None:
                self.stderr.write(
                    self.style.WARNING(
                        f"No role available to assign for staff id={staff.id}; skipped."
                    )
                )
                continue

            StaffRole.objects.create(
                role=target_role,
                staff_id=staff.id,
                is_active=1,
                created_at=now,
                updated_at=None,
            )
            created += 1
            self.stdout.write(
                f"  Linked staff id={staff.id} ({staff.email}) -> {target_role.name}"
            )

        return created
