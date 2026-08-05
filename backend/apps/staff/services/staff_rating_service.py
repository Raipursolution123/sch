import logging
from typing import Any

from django.utils import timezone

from apps.staff.models.staff import Staff
from apps.staff.models.staff_rating import StaffRating
from apps.staff.selectors.staff_selectors import staff_full_name

logger = logging.getLogger(__name__)


class StaffRatingService:
    """Admin review of teacher ratings (status: 0=declined, 1=approved)."""

    def list_ratings(self, *, status: int | None = None) -> list[dict[str, Any]]:
        qs = StaffRating.objects.all().order_by("-entrydt", "-id")
        if status is not None:
            qs = qs.filter(status=status)
        rows = list(qs[:1000])
        staff_map = {
            s.id: s for s in Staff.objects.filter(id__in={r.staff_id for r in rows})
        }
        return [self._to_dict(row, staff_map) for row in rows]

    def approve(self, pk: int) -> dict[str, Any]:
        return self._set_status(pk, 1)

    def decline(self, pk: int) -> dict[str, Any]:
        return self._set_status(pk, 0)

    def delete(self, pk: int) -> None:
        row = StaffRating.objects.filter(id=pk).first()
        if row is None:
            raise LookupError("Staff rating not found.")
        row.delete()
        logger.info("Deleted staff rating id=%s", pk)

    def _set_status(self, pk: int, status: int) -> dict[str, Any]:
        row = StaffRating.objects.filter(id=pk).first()
        if row is None:
            raise LookupError("Staff rating not found.")
        row.status = status
        row.entrydt = timezone.now()
        row.save(update_fields=["status", "entrydt"])
        staff_map = {
            row.staff_id: Staff.objects.filter(id=row.staff_id).first()
        }
        return self._to_dict(row, {k: v for k, v in staff_map.items() if v})

    def _to_dict(
        self, row: StaffRating, staff_map: dict[int, Staff]
    ) -> dict[str, Any]:
        staff = staff_map.get(row.staff_id)
        status_label = (
            "approved" if int(row.status or 0) == 1 else "declined"
        )
        return {
            "id": row.id,
            "staff_id": row.staff_id,
            "staff_name": staff_full_name(staff) if staff else str(row.staff_id),
            "comment": row.comment or "",
            "rate": row.rate,
            "user_id": row.user_id,
            "role": row.role or "",
            "status": int(row.status or 0),
            "status_label": status_label,
            "entrydt": (
                row.entrydt.isoformat(sep=" ", timespec="seconds")
                if row.entrydt
                else None
            ),
        }
