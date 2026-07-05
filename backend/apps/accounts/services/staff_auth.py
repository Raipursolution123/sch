from __future__ import annotations

from django.utils import timezone

from apps.accounts.models import User
from apps.accounts.services.legacy_password import (
    hash_legacy_password,
    verify_staff_password,
)
from apps.staff.models import Staff


def authenticate_staff(username: str, password: str) -> User | None:
    """Legacy admin login uses staff.email + bcrypt password, not the users table."""
    staff = Staff.objects.filter(email=username, is_active=1).order_by("id").first()
    if not staff or not verify_staff_password(password, staff.password):
        return None
    return ensure_staff_user_bridge(staff)


def ensure_staff_user_bridge(staff: Staff) -> User:
    user = User.objects.filter(
        username=staff.email, role="staff", user_id=staff.id
    ).first()
    if user:
        if staff.user_id != user.id:
            Staff.objects.filter(pk=staff.id).update(user_id=user.id)
        return user

    now = timezone.now()
    user = User.objects.create(
        user_id=staff.id,
        username=staff.email[:50],
        password=hash_legacy_password(""),
        childs="",
        role="staff",
        lang_id=staff.lang_id,
        currency_id=staff.currency_id or 0,
        verification_code="",
        is_active="yes",
        created_at=now,
        updated_at=None,
    )
    Staff.objects.filter(pk=staff.id).update(user_id=user.id)
    return user
