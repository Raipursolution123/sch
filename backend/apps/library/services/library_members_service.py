from __future__ import annotations

from typing import Any

from django.utils import timezone

from apps.library.domain.library_exceptions import (
    LibraryNotFoundError,
    LibraryValidationError,
)
from apps.library.models.libarary_members import LibararyMembers


class LibraryMembersService:
    def list_members(self, *, query: str | None = None):
        qs = LibararyMembers.objects.all().order_by("-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(library_card_no__icontains=term)
        return qs

    def get_member(self, member_id: int) -> LibararyMembers:
        member = LibararyMembers.objects.filter(id=member_id).first()
        if member is None:
            raise LibraryNotFoundError("Library member not found.")
        return member

    def create_member(self, payload: dict[str, Any]) -> LibararyMembers:
        member_type = str(payload.get("member_type", "")).strip().lower()
        if member_type not in {"student", "staff", "teacher"}:
            raise LibraryValidationError(
                "member_type must be student, staff, or teacher."
            )
        member_ref = payload.get("member_id")
        if not member_ref:
            raise LibraryValidationError("member_id (student/staff id) is required.")

        card = str(payload.get("library_card_no", "")).strip() or None
        return LibararyMembers.objects.create(
            library_card_no=card,
            member_type=member_type,
            member_id=int(member_ref),
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            created_at=timezone.now(),
        )
