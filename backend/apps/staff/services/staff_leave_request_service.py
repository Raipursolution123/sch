import logging
from datetime import date, datetime
from typing import Any

from django.utils import timezone

from apps.staff.domain.staff_exceptions import StaffNotFoundError, StaffValidationError
from apps.staff.models.leave_types import LeaveTypes
from apps.staff.models.staff import Staff
from apps.staff.models.staff_leave_details import StaffLeaveDetails
from apps.staff.models.staff_leave_request import StaffLeaveRequest

logger = logging.getLogger(__name__)

STATUS_PENDING = "0"
STATUS_APPROVED = "1"
STATUS_REJECTED = "2"

STATUS_LABELS = {
    STATUS_PENDING: "pending",
    STATUS_APPROVED: "approved",
    STATUS_REJECTED: "rejected",
    "pending": "pending",
    "approved": "approved",
    "rejected": "rejected",
    "disapproved": "rejected",
}


class StaffLeaveRequestService:
    def list_requests(self) -> list[dict[str, Any]]:
        rows = list(StaffLeaveRequest.objects.all().order_by("-id"))
        return self._enrich(rows)

    def get_request(self, request_id: int) -> dict[str, Any]:
        row = StaffLeaveRequest.objects.filter(id=request_id).first()
        if row is None:
            raise StaffNotFoundError("Leave request not found.")
        return self._enrich([row])[0]

    def create_request(self, payload: dict[str, Any]) -> dict[str, Any]:
        cleaned = self._validate_create(payload)
        row = StaffLeaveRequest.objects.create(
            staff_id=cleaned["staff_id"],
            leave_type_id=cleaned["leave_type_id"],
            leave_from=cleaned["leave_from"],
            leave_to=cleaned["leave_to"],
            leave_days=cleaned["leave_days"],
            employee_remark=cleaned["employee_remark"],
            admin_remark="",
            status=STATUS_PENDING,
            applied_by=cleaned.get("applied_by"),
            document_file=cleaned.get("document_file") or "",
            date=cleaned["date"],
            created_at=timezone.now(),
        )
        logger.info(
            "Created staff leave request id=%s staff_id=%s", row.id, row.staff_id
        )
        return self._enrich([row])[0]

    def update_status(self, request_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = StaffLeaveRequest.objects.filter(id=request_id).first()
        if row is None:
            raise StaffNotFoundError("Leave request not found.")

        status_value = self._parse_status(payload.get("status"))
        if status_value == STATUS_PENDING:
            raise StaffValidationError("Status must be approved or rejected.")

        current = self._normalize_status(row.status)
        if current != "pending":
            raise StaffValidationError("Only pending leave requests can be reviewed.")

        admin_remark = payload.get("admin_remark")
        remark = (
            str(admin_remark).strip()
            if admin_remark not in (None, "")
            else row.admin_remark or ""
        )

        row.status = status_value
        row.admin_remark = remark
        row.save(update_fields=["status", "admin_remark"])
        logger.info("Updated leave request id=%s status=%s", row.id, status_value)
        return self._enrich([row])[0]

    def _enrich(self, rows: list[StaffLeaveRequest]) -> list[dict[str, Any]]:
        staff_ids = {row.staff_id for row in rows if row.staff_id}
        type_ids = {row.leave_type_id for row in rows if row.leave_type_id}
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
                    "leave_from": self._date_str(row.leave_from),
                    "leave_to": self._date_str(row.leave_to),
                    "leave_days": row.leave_days,
                    "employee_remark": row.employee_remark,
                    "admin_remark": row.admin_remark,
                    "status": self._normalize_status(row.status),
                    "applied_by": row.applied_by,
                    "document_file": row.document_file or None,
                    "date": self._date_str(row.date),
                    "created_at": self._datetime_str(row.created_at),
                }
            )
        return data

    def _validate_create(self, payload: dict[str, Any]) -> dict[str, Any]:
        staff_id = payload.get("staff_id")
        leave_type_id = payload.get("leave_type_id")
        if not staff_id:
            raise StaffValidationError("Staff is required.")
        if not leave_type_id:
            raise StaffValidationError("Leave type is required.")

        try:
            staff_id = int(staff_id)
            leave_type_id = int(leave_type_id)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("Invalid staff or leave type.") from exc

        if not Staff.objects.filter(id=staff_id).exists():
            raise StaffValidationError("Selected staff was not found.")
        leave_type = LeaveTypes.objects.filter(id=leave_type_id).first()
        if leave_type is None:
            raise StaffValidationError("Selected leave type was not found.")
        if str(leave_type.is_active).lower() not in {"yes", "1", "true"}:
            raise StaffValidationError("Selected leave type is not active.")

        leave_from = self._parse_date(payload.get("leave_from"), "Leave from")
        leave_to = self._parse_date(payload.get("leave_to"), "Leave to")
        if leave_to < leave_from:
            raise StaffValidationError("Leave to cannot be before leave from.")

        leave_days = payload.get("leave_days")
        if leave_days in (None, ""):
            leave_days = (leave_to - leave_from).days + 1
        else:
            try:
                leave_days = int(leave_days)
            except (TypeError, ValueError) as exc:
                raise StaffValidationError("Leave days must be an integer.") from exc
        if leave_days <= 0:
            raise StaffValidationError("Leave days must be greater than zero.")

        self._assert_leave_balance(staff_id, leave_type_id, leave_days)

        remark = str(payload.get("employee_remark") or "").strip()
        applied_by = payload.get("applied_by")
        if applied_by in (None, ""):
            applied_by = None
        else:
            applied_by = int(applied_by)

        apply_date = payload.get("date")
        if apply_date in (None, ""):
            apply_date = timezone.now().date()
        else:
            apply_date = self._parse_date(apply_date, "Date")

        return {
            "staff_id": staff_id,
            "leave_type_id": leave_type_id,
            "leave_from": leave_from,
            "leave_to": leave_to,
            "leave_days": leave_days,
            "employee_remark": remark,
            "applied_by": applied_by,
            "document_file": str(payload.get("document_file") or "").strip(),
            "date": apply_date,
        }

    def _assert_leave_balance(
        self, staff_id: int, leave_type_id: int, leave_days: int
    ) -> None:
        allotment = StaffLeaveDetails.objects.filter(
            staff_id=staff_id, leave_type_id=leave_type_id
        ).first()
        if allotment is None:
            return
        try:
            alloted = float(allotment.alloted_leave or 0)
        except (TypeError, ValueError):
            return

        used = 0.0
        for row in StaffLeaveRequest.objects.filter(
            staff_id=staff_id, leave_type_id=leave_type_id
        ):
            status = str(row.status or "").strip().lower()
            if status in {"0", "pending", "1", "approved"}:
                used += float(row.leave_days or 0)

        remaining = alloted - used
        if leave_days > remaining:
            raise StaffValidationError(
                f"Insufficient leave balance. Remaining: {remaining:g} day(s)."
            )

    def _parse_status(self, value: Any) -> str:
        if value in (None, ""):
            raise StaffValidationError("Status is required.")
        normalized = str(value).strip().lower()
        if normalized in {"1", "approved", "approve"}:
            return STATUS_APPROVED
        if normalized in {"2", "rejected", "reject", "disapproved"}:
            return STATUS_REJECTED
        if normalized in {"0", "pending"}:
            return STATUS_PENDING
        raise StaffValidationError("Status must be approved or rejected.")

    def _normalize_status(self, value: Any) -> str:
        key = str(value or "").strip().lower()
        return STATUS_LABELS.get(key, "pending")

    def _parse_date(self, value: Any, label: str) -> date:
        if value in (None, ""):
            raise StaffValidationError(f"{label} is required.")
        if isinstance(value, date) and not isinstance(value, datetime):
            return value
        if isinstance(value, datetime):
            return value.date()
        try:
            return date.fromisoformat(str(value)[:10])
        except ValueError as exc:
            raise StaffValidationError(f"{label} must be a valid date.") from exc

    def _date_str(self, value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, str):
            return value[:10]
        try:
            return value.strftime("%Y-%m-%d")
        except Exception:
            return str(value)

    def _datetime_str(self, value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, str):
            return value
        try:
            return value.strftime("%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            return str(value)
