from __future__ import annotations

import datetime
import logging
from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.staff.domain.staff_exceptions import (
    StaffConflictError,
    StaffNotFoundError,
    StaffValidationError,
)
from apps.staff.models.staff import Staff
from apps.staff.models.staff_payroll import StaffPayroll
from apps.staff.models.staff_payslip import StaffPayslip

logger = logging.getLogger(__name__)


def _normalize_active(value: Any, default: str = "yes") -> str:
    if value is None:
        return default
    if value in ("yes", "no"):
        return value
    return "yes" if value in (1, True, "1", "true", "True") else "no"


class StaffPayrollService:
    """Pay-scale master (`staff_payroll`) + payslip list/create/delete."""

    def list_scales(self, *, query: str | None = None) -> list[dict[str, Any]]:
        qs = StaffPayroll.objects.all().order_by("pay_scale", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(Q(pay_scale__icontains=term) | Q(grade__icontains=term))
        return [self._scale_dict(row) for row in qs]

    def get_scale(self, pk: int) -> dict[str, Any]:
        row = StaffPayroll.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Pay scale not found.")
        return self._scale_dict(row)

    def create_scale(self, payload: dict[str, Any]) -> dict[str, Any]:
        pay_scale = str(payload.get("pay_scale") or "").strip()
        if not pay_scale:
            raise StaffValidationError("Pay scale is required.")
        try:
            basic = int(payload.get("basic_salary") or 0)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("basic_salary must be an integer.") from exc
        if basic < 0:
            raise StaffValidationError("basic_salary cannot be negative.")
        if StaffPayroll.objects.filter(pay_scale__iexact=pay_scale).exists():
            raise StaffConflictError("A pay scale with this name already exists.")
        row = StaffPayroll.objects.create(
            basic_salary=basic,
            pay_scale=pay_scale,
            grade=str(payload.get("grade") or "").strip(),
            is_active=_normalize_active(payload.get("is_active"), "yes"),
        )
        return self._scale_dict(row)

    def update_scale(self, pk: int, payload: dict[str, Any]) -> dict[str, Any]:
        row = StaffPayroll.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Pay scale not found.")
        if "pay_scale" in payload:
            pay_scale = str(payload.get("pay_scale") or "").strip()
            if not pay_scale:
                raise StaffValidationError("Pay scale cannot be empty.")
            if (
                StaffPayroll.objects.exclude(id=pk)
                .filter(pay_scale__iexact=pay_scale)
                .exists()
            ):
                raise StaffConflictError("A pay scale with this name already exists.")
            row.pay_scale = pay_scale
        if "basic_salary" in payload and payload["basic_salary"] is not None:
            try:
                basic = int(payload["basic_salary"])
            except (TypeError, ValueError) as exc:
                raise StaffValidationError("basic_salary must be an integer.") from exc
            if basic < 0:
                raise StaffValidationError("basic_salary cannot be negative.")
            row.basic_salary = basic
        if "grade" in payload:
            row.grade = str(payload.get("grade") or "").strip()
        if "is_active" in payload and payload["is_active"] is not None:
            row.is_active = _normalize_active(payload["is_active"])
        row.save()
        return self._scale_dict(row)

    def delete_scale(self, pk: int) -> None:
        row = StaffPayroll.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Pay scale not found.")
        if _normalize_active(row.is_active, "no") == "yes":
            raise StaffValidationError("Deactivate the pay scale before deleting.")
        row.delete()

    def list_payslips(
        self, *, query: str | None = None, staff_id: int | None = None
    ) -> list[dict[str, Any]]:
        qs = StaffPayslip.objects.all().order_by("-id")
        if staff_id:
            qs = qs.filter(staff_id=staff_id)
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(month__icontains=term)
                | Q(year__icontains=term)
                | Q(status__icontains=term)
            )
        staff_ids = {row.staff_id for row in qs}
        staff_map = {s.id: s for s in Staff.objects.filter(id__in=staff_ids)}
        return [self._payslip_dict(row, staff_map.get(row.staff_id)) for row in qs]

    def create_payslip(
        self, payload: dict[str, Any], *, generated_by: int | None
    ) -> dict[str, Any]:
        try:
            staff_id = int(payload.get("staff_id") or 0)
        except (TypeError, ValueError) as exc:
            raise StaffValidationError("staff_id is required.") from exc
        staff = Staff.objects.filter(id=staff_id).first()
        if staff is None:
            raise StaffNotFoundError("Staff not found.")

        month = str(payload.get("month") or "").strip()
        year = str(payload.get("year") or "").strip()
        if not month or not year:
            raise StaffValidationError("month and year are required.")

        basic = payload.get("basic")
        if basic is None:
            basic = float(staff.basic_salary or 0)
        else:
            basic = float(basic)
        total_allowance = float(payload.get("total_allowance") or 0)
        total_deduction = float(payload.get("total_deduction") or 0)
        leave_deduction = int(payload.get("leave_deduction") or 0)
        tax = str(payload.get("tax") or "0").strip() or "0"
        try:
            tax_amount = float(tax)
        except ValueError:
            tax_amount = 0.0
        net = basic + total_allowance - total_deduction - leave_deduction - tax_amount
        if payload.get("net_salary") is not None:
            net = float(payload["net_salary"])

        payment_date = payload.get("payment_date") or timezone.now().date()
        if isinstance(payment_date, str):
            payment_date = datetime.datetime.strptime(payment_date, "%Y-%m-%d").date()

        row = StaffPayslip.objects.create(
            staff_id=staff_id,
            basic=basic,
            total_allowance=total_allowance,
            total_deduction=total_deduction,
            leave_deduction=leave_deduction,
            tax=tax,
            net_salary=net,
            status=str(payload.get("status") or "generated").strip() or "generated",
            month=month,
            year=year,
            payment_mode=str(payload.get("payment_mode") or "cash").strip() or "cash",
            linked_ledger_bank=payload.get("linked_ledger_bank"),
            bank_name=str(payload.get("bank_name") or "").strip() or None,
            transaction_id=str(payload.get("transaction_id") or "").strip() or None,
            payment_date=payment_date,
            remark=str(payload.get("remark") or "").strip()[:200],
            generated_by=generated_by,
            created_at=timezone.now(),
            payment_modes=str(
                payload.get("payment_modes") or payload.get("payment_mode") or "cash"
            )[:100],
        )
        logger.info("Created payslip id=%s staff=%s", row.id, staff_id)
        return self._payslip_dict(row, staff)

    def delete_payslip(self, pk: int) -> None:
        row = StaffPayslip.objects.filter(id=pk).first()
        if row is None:
            raise StaffNotFoundError("Payslip not found.")
        row.delete()

    def _scale_dict(self, row: StaffPayroll) -> dict[str, Any]:
        return {
            "id": row.id,
            "basic_salary": row.basic_salary,
            "pay_scale": row.pay_scale or "",
            "grade": row.grade or "",
            "is_active": _normalize_active(row.is_active, "no"),
        }

    def _payslip_dict(self, row: StaffPayslip, staff: Staff | None) -> dict[str, Any]:
        name = ""
        if staff is not None:
            name = " ".join(
                p for p in (staff.name or "", staff.surname or "") if p
            ).strip()
        return {
            "id": row.id,
            "staff_id": row.staff_id,
            "staff_name": name,
            "employee_id": staff.employee_id if staff else "",
            "basic": row.basic,
            "total_allowance": row.total_allowance,
            "total_deduction": row.total_deduction,
            "leave_deduction": row.leave_deduction,
            "tax": row.tax,
            "net_salary": row.net_salary,
            "status": row.status or "",
            "month": row.month or "",
            "year": row.year or "",
            "payment_mode": row.payment_mode or "",
            "payment_date": (
                row.payment_date.isoformat() if row.payment_date else None
            ),
            "remark": row.remark or "",
            "created_at": (row.created_at.isoformat() if row.created_at else None),
        }
