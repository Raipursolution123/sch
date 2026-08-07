import logging
from datetime import date, datetime
from typing import Any

from django.utils import timezone

from apps.staff.domain.staff_exceptions import StaffNotFoundError, StaffValidationError
from apps.staff.models.cyc_staff_payroll_increment import CycStaffPayrollIncrement
from apps.staff.models.staff import Staff
from apps.staff.selectors.staff_selectors import staff_full_name

logger = logging.getLogger(__name__)

STATUS_PENDING = "pending"
STATUS_APPROVED = "approved"
STATUS_REJECTED = "rejected"


class StaffPayrollIncrementService:
    def list_requests(self, *, status: str | None = None) -> list[dict[str, Any]]:
        qs = CycStaffPayrollIncrement.objects.all().order_by("-date", "-pi_id")
        if status:
            qs = qs.filter(status=status)
        rows = list(qs[:1000])
        staff_map = {
            s.id: s for s in Staff.objects.filter(id__in={r.staff_id for r in rows})
        }
        return [self._to_dict(row, staff_map) for row in rows]

    def create_request(
        self, payload: dict[str, Any], *, entry_by: int
    ) -> dict[str, Any]:
        cleaned = self._validate_create(payload)
        today = timezone.now().date()
        row = CycStaffPayrollIncrement.objects.create(
            staff_id=cleaned["staff_id"],
            month=cleaned["month"],
            year=cleaned["year"],
            basic_salary=cleaned["basic_salary"],
            increment=cleaned["increment"],
            date=today,
            entry_by=entry_by,
            status=STATUS_PENDING,
            action_by=0,
            action_date=today,
        )
        logger.info(
            "Created payroll increment id=%s staff_id=%s",
            row.pi_id,
            row.staff_id,
        )
        staff_map = {
            row.staff_id: Staff.objects.filter(id=row.staff_id).first(),
        }
        return self._to_dict(row, staff_map)

    def approve(self, pk: int, *, action_by: int) -> dict[str, Any]:
        row = self._get_row(pk)
        if str(row.status).lower() != STATUS_PENDING:
            raise StaffValidationError("Only pending increments can be approved.")
        staff = Staff.objects.filter(id=row.staff_id).first()
        if staff is None:
            raise StaffNotFoundError("Staff not found.")
        staff.basic_salary = float(staff.basic_salary or 0) + float(row.increment)
        staff.save(update_fields=["basic_salary"])
        row.status = STATUS_APPROVED
        row.action_by = action_by
        row.action_date = timezone.now().date()
        row.save(update_fields=["status", "action_by", "action_date"])
        logger.info("Approved payroll increment id=%s", pk)
        return self._to_dict(row, {staff.id: staff})

    def reject(self, pk: int, *, action_by: int) -> dict[str, Any]:
        row = self._get_row(pk)
        if str(row.status).lower() != STATUS_PENDING:
            raise StaffValidationError("Only pending increments can be rejected.")
        row.status = STATUS_REJECTED
        row.action_by = action_by
        row.action_date = timezone.now().date()
        row.save(update_fields=["status", "action_by", "action_date"])
        logger.info("Rejected payroll increment id=%s", pk)
        staff = Staff.objects.filter(id=row.staff_id).first()
        staff_map = {row.staff_id: staff} if staff else {}
        return self._to_dict(row, staff_map)

    def _get_row(self, pk: int) -> CycStaffPayrollIncrement:
        row = CycStaffPayrollIncrement.objects.filter(pi_id=pk).first()
        if row is None:
            raise StaffNotFoundError("Payroll increment request not found.")
        return row

    def _validate_create(self, payload: dict[str, Any]) -> dict[str, Any]:
        staff_id = payload.get("staff_id")
        if not staff_id:
            raise StaffValidationError("Staff is required.")
        try:
            staff_id = int(staff_id)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("Invalid staff selection.") from exc

        staff = Staff.objects.filter(id=staff_id).first()
        if staff is None:
            raise StaffValidationError("Selected staff was not found.")

        increment = payload.get("increment")
        if increment in (None, ""):
            raise StaffValidationError("Increment amount is required.")
        try:
            increment = float(increment)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("Increment must be a number.") from exc
        if increment <= 0:
            raise StaffValidationError("Increment must be greater than zero.")

        now = timezone.now()
        month = str(payload.get("month") or now.strftime("%B")).strip()
        year = str(payload.get("year") or now.year).strip()
        if not month:
            raise StaffValidationError("Month is required.")
        if not year:
            raise StaffValidationError("Year is required.")

        return {
            "staff_id": staff_id,
            "month": month,
            "year": year,
            "basic_salary": float(staff.basic_salary or 0),
            "increment": increment,
        }

    def _to_dict(
        self, row: CycStaffPayrollIncrement, staff_map: dict[int, Staff]
    ) -> dict[str, Any]:
        staff = staff_map.get(row.staff_id)
        return {
            "id": row.pi_id,
            "staff_id": row.staff_id,
            "staff_name": staff_full_name(staff) if staff else str(row.staff_id),
            "employee_id": staff.employee_id if staff else "",
            "month": row.month or "",
            "year": row.year or "",
            "basic_salary": row.basic_salary,
            "increment": row.increment,
            "date": self._date_str(row.date),
            "entry_by": row.entry_by,
            "status": str(row.status or STATUS_PENDING).lower(),
            "action_by": row.action_by,
            "action_date": self._date_str(row.action_date),
        }

    def _date_str(self, value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, str):
            return value[:10]
        if isinstance(value, datetime):
            return value.date().isoformat()
        if isinstance(value, date):
            return value.isoformat()
        try:
            return value.strftime("%Y-%m-%d")
        except Exception:
            return str(value)
