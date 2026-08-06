from __future__ import annotations

import datetime
from typing import Any

from django.utils import timezone
from apps.staff.domain.staff_exceptions import (
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.staff import Staff
from apps.staff.models.cyc_staff_payroll_increment import CycStaffPayrollIncrement


class StaffPayrollIncrementService:
    """Service to handle staff payroll increments (CRUD & approvals)."""

    def list(self) -> list[dict[str, Any]]:
        qs = CycStaffPayrollIncrement.objects.all().order_by("-pi_id")
        staff_ids = {row.staff_id for row in qs}
        staff_map = {s.id: s for s in Staff.objects.filter(id__in=staff_ids)}

        results = []
        for row in qs:
            staff = staff_map.get(row.staff_id)
            staff_name = ""
            employee_id = ""
            if staff:
                staff_name = " ".join(
                    p for p in (staff.name or "", staff.surname or "") if p
                ).strip() or f"Staff #{staff.id}"
                employee_id = staff.employee_id or ""

            results.append({
                "pi_id": row.pi_id,
                "staff_id": row.staff_id,
                "staff_name": staff_name,
                "employee_id": employee_id,
                "month": row.month or "",
                "year": row.year or "",
                "basic_salary": row.basic_salary,
                "increment": row.increment,
                "date": row.date.isoformat() if row.date else None,
                "status": row.status or "pending",
                "action_date": row.action_date.isoformat() if (row.action_date and row.action_date.year != 1970) else None,
            })
        return results

    def create(self, payload: dict[str, Any], entry_by: int) -> dict[str, Any]:
        try:
            staff_id = int(payload.get("staff_id") or 0)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("staff_id must be a valid integer.") from exc

        staff = Staff.objects.filter(id=staff_id).first()
        if staff is None:
            raise StaffNotFoundError("Staff not found.")

        month = str(payload.get("month") or "").strip()
        year = str(payload.get("year") or "").strip()
        if not month or not year:
            raise StaffValidationError("month and year are required.")

        try:
            increment_val = float(payload.get("increment") or 0)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("increment must be a valid number.") from exc

        if increment_val <= 0:
            raise StaffValidationError("Increment must be greater than zero.")

        basic = float(staff.basic_salary or 0.0)

        row = CycStaffPayrollIncrement.objects.create(
            staff_id=staff_id,
            month=month,
            year=year,
            basic_salary=basic,
            increment=increment_val,
            date=timezone.now().date(),
            entry_by=entry_by,
            status="pending",
            action_by=0,
            action_date=datetime.date(1970, 1, 1),
        )
        
        staff_name = " ".join(
            p for p in (staff.name or "", staff.surname or "") if p
        ).strip() or f"Staff #{staff.id}"

        return {
            "pi_id": row.pi_id,
            "staff_id": row.staff_id,
            "staff_name": staff_name,
            "employee_id": staff.employee_id or "",
            "month": row.month,
            "year": row.year,
            "basic_salary": row.basic_salary,
            "increment": row.increment,
            "date": row.date.isoformat(),
            "status": row.status,
            "action_date": None,
        }

    def approve(self, pk: int, action_by: int) -> dict[str, Any]:
        row = CycStaffPayrollIncrement.objects.filter(pi_id=pk).first()
        if row is None:
            raise StaffNotFoundError("Payroll increment request not found.")

        if row.status != "pending":
            raise StaffValidationError(f"Cannot approve an increment that is already {row.status}.")

        staff = Staff.objects.filter(id=row.staff_id).first()
        if staff is None:
            raise StaffNotFoundError("Associated staff not found.")

        # Update staff basic salary
        old_salary = float(staff.basic_salary or 0.0)
        new_salary = old_salary + row.increment
        staff.basic_salary = new_salary
        staff.save()

        # Update increment request status
        row.status = "approved"
        row.action_by = action_by
        row.action_date = timezone.now().date()
        row.save()

        return {"message": "Payroll increment approved successfully.", "new_salary": new_salary}

    def reject(self, pk: int, action_by: int) -> dict[str, Any]:
        row = CycStaffPayrollIncrement.objects.filter(pi_id=pk).first()
        if row is None:
            raise StaffNotFoundError("Payroll increment request not found.")

        if row.status != "pending":
            raise StaffValidationError(f"Cannot reject an increment that is already {row.status}.")

        row.status = "rejected"
        row.action_by = action_by
        row.action_date = timezone.now().date()
        row.save()

        return {"message": "Payroll increment request rejected successfully."}

    def delete(self, pk: int) -> None:
        row = CycStaffPayrollIncrement.objects.filter(pi_id=pk).first()
        if row is None:
            raise StaffNotFoundError("Payroll increment request not found.")
        row.delete()
