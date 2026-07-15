import logging
from typing import Any

from apps.staff.domain.staff_exceptions import StaffNotFoundError, StaffValidationError
from apps.staff.models.leave_types import LeaveTypes
from apps.staff.models.staff import Staff
from apps.staff.models.staff_leave_details import StaffLeaveDetails
from apps.staff.models.staff_leave_request import StaffLeaveRequest

logger = logging.getLogger(__name__)


class StaffLeaveAllotmentService:
    def list_allotments(self, staff_id: int | None = None) -> list[dict[str, Any]]:
        qs = StaffLeaveDetails.objects.all().order_by("staff_id", "leave_type_id")
        if staff_id is not None:
            qs = qs.filter(staff_id=staff_id)
        rows = list(qs)
        return self._enrich(rows)

    def get_roster(self, staff_id: int) -> dict[str, Any]:
        staff = Staff.objects.filter(id=staff_id).first()
        if staff is None:
            raise StaffNotFoundError("Staff not found.")

        leave_types = list(LeaveTypes.objects.all().order_by("type"))
        allotment_map = {
            row.leave_type_id: row
            for row in StaffLeaveDetails.objects.filter(staff_id=staff_id)
        }
        used_by_type = self._used_days_by_type(staff_id)

        allotments: list[dict[str, Any]] = []
        for leave_type in leave_types:
            existing = allotment_map.get(leave_type.id)
            alloted = existing.alloted_leave if existing else "0"
            try:
                alloted_num = float(alloted)
            except (TypeError, ValueError):
                alloted_num = 0.0
            used = used_by_type.get(leave_type.id, 0)
            active = str(leave_type.is_active or "").strip().lower()
            allotments.append(
                {
                    "id": existing.id if existing else None,
                    "leave_type_id": leave_type.id,
                    "leave_type_name": leave_type.type,
                    "leave_type_active": (
                        "yes" if active in {"yes", "1", "true"} else "no"
                    ),
                    "alloted_leave": alloted,
                    "used_leave": used,
                    "remaining_leave": max(alloted_num - used, 0),
                }
            )

        return {
            "staff_id": staff.id,
            "staff_name": f"{staff.name or ''} {staff.surname or ''}".strip() or None,
            "employee_id": staff.employee_id,
            "allotments": allotments,
        }

    def upsert_allotment(self, payload: dict[str, Any]) -> dict[str, Any]:
        staff_id = payload.get("staff_id")
        leave_type_id = payload.get("leave_type_id")
        alloted_leave = payload.get("alloted_leave")

        if not staff_id:
            raise StaffValidationError("Staff is required.")
        if not leave_type_id:
            raise StaffValidationError("Leave type is required.")
        if alloted_leave in (None, ""):
            raise StaffValidationError("Allotted leave is required.")

        try:
            staff_id = int(staff_id)
            leave_type_id = int(leave_type_id)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("Invalid staff or leave type.") from exc

        if not Staff.objects.filter(id=staff_id).exists():
            raise StaffValidationError("Selected staff was not found.")
        if not LeaveTypes.objects.filter(id=leave_type_id).exists():
            raise StaffValidationError("Selected leave type was not found.")

        alloted_str = str(alloted_leave).strip()
        try:
            alloted_value = float(alloted_str)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("Allotted leave must be a number.") from exc
        if alloted_value < 0:
            raise StaffValidationError("Allotted leave cannot be negative.")

        existing = StaffLeaveDetails.objects.filter(
            staff_id=staff_id, leave_type_id=leave_type_id
        ).first()
        if existing is None:
            existing = StaffLeaveDetails.objects.create(
                staff_id=staff_id,
                leave_type_id=leave_type_id,
                alloted_leave=alloted_str,
            )
            logger.info(
                "Created leave allotment id=%s staff_id=%s type_id=%s",
                existing.id,
                staff_id,
                leave_type_id,
            )
        else:
            existing.alloted_leave = alloted_str
            existing.save(update_fields=["alloted_leave"])
            logger.info("Updated leave allotment id=%s", existing.id)

        return self._enrich([existing])[0]

    def save_roster(
        self, *, staff_id: int, entries: list[dict[str, Any]]
    ) -> dict[str, Any]:
        if not entries:
            raise StaffValidationError("At least one allotment entry is required.")
        if not Staff.objects.filter(id=staff_id).exists():
            raise StaffNotFoundError("Staff not found.")

        saved = 0
        for entry in entries:
            self.upsert_allotment(
                {
                    "staff_id": staff_id,
                    "leave_type_id": entry.get("leave_type_id"),
                    "alloted_leave": entry.get("alloted_leave"),
                }
            )
            saved += 1

        return {"staff_id": staff_id, "saved_count": saved, **self.get_roster(staff_id)}

    def delete_allotment(self, allotment_id: int) -> None:
        row = StaffLeaveDetails.objects.filter(id=allotment_id).first()
        if row is None:
            raise StaffNotFoundError("Leave allotment not found.")
        row.delete()
        logger.info("Deleted leave allotment id=%s", allotment_id)

    def _used_days_by_type(self, staff_id: int) -> dict[int, float]:
        """Pending + approved days count against leave balance."""
        totals: dict[int, float] = {}
        for row in StaffLeaveRequest.objects.filter(staff_id=staff_id):
            status = str(row.status or "").strip().lower()
            if status not in {"0", "pending", "1", "approved"}:
                continue
            totals[row.leave_type_id] = totals.get(row.leave_type_id, 0) + float(
                row.leave_days or 0
            )
        return totals

    def _enrich(self, rows: list[StaffLeaveDetails]) -> list[dict[str, Any]]:
        staff_ids = {row.staff_id for row in rows}
        type_ids = {row.leave_type_id for row in rows}
        staff_map = {s.id: s for s in Staff.objects.filter(id__in=staff_ids)}
        type_map = {t.id: t for t in LeaveTypes.objects.filter(id__in=type_ids)}

        data: list[dict[str, Any]] = []
        for row in rows:
            staff = staff_map.get(row.staff_id)
            leave_type = type_map.get(row.leave_type_id)
            staff_name = None
            if staff:
                staff_name = f"{staff.name or ''} {staff.surname or ''}".strip() or None
            data.append(
                {
                    "id": row.id,
                    "staff_id": row.staff_id,
                    "staff_name": staff_name,
                    "employee_id": staff.employee_id if staff else None,
                    "leave_type_id": row.leave_type_id,
                    "leave_type_name": leave_type.type if leave_type else None,
                    "alloted_leave": row.alloted_leave,
                }
            )
        return data
