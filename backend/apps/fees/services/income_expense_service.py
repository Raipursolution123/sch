from __future__ import annotations

from typing import Any

from django.db.models import Q
from django.utils import timezone

from apps.fees.domain.fee_exceptions import FeeNotFoundError, FeeValidationError
from apps.fees.models.expense_head import ExpenseHead
from apps.fees.models.expenses import Expenses
from apps.fees.models.income import Income
from apps.fees.models.income_head import IncomeHead


def _active_filter(qs):
    return qs.filter(Q(is_deleted="no") | Q(is_deleted__isnull=True) | Q(is_deleted=""))


class IncomeHeadService:
    def list(self, *, query: str | None = None):
        qs = _active_filter(IncomeHead.objects.all()).order_by("income_category", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(income_category__icontains=term) | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> IncomeHead:
        row = _active_filter(IncomeHead.objects.filter(id=pk)).first()
        if row is None:
            raise FeeNotFoundError("Income head not found.")
        return row

    def create(self, payload: dict[str, Any]) -> IncomeHead:
        name = str(payload.get("income_category", "")).strip()
        if not name:
            raise FeeValidationError("Income category is required.")
        return IncomeHead.objects.create(
            income_category=name,
            description=str(payload.get("description", "")).strip() or None,
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            is_deleted="no",
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> IncomeHead:
        row = self.get(pk)
        if "income_category" in payload:
            name = str(payload["income_category"]).strip()
            if not name:
                raise FeeValidationError("Income category cannot be empty.")
            row.income_category = name
        if "description" in payload:
            row.description = str(payload["description"]).strip() or None
        if "is_active" in payload:
            row.is_active = str(payload["is_active"]).strip() or "yes"
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        row.is_deleted = "yes"
        row.updated_at = timezone.now().date()
        row.save(update_fields=["is_deleted", "updated_at"])


class ExpenseHeadService:
    def list(self, *, query: str | None = None):
        qs = _active_filter(ExpenseHead.objects.all()).order_by("exp_category", "id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(exp_category__icontains=term) | Q(description__icontains=term)
            )
        return qs

    def get(self, pk: int) -> ExpenseHead:
        row = _active_filter(ExpenseHead.objects.filter(id=pk)).first()
        if row is None:
            raise FeeNotFoundError("Expense head not found.")
        return row

    def create(self, payload: dict[str, Any]) -> ExpenseHead:
        name = str(payload.get("exp_category", "")).strip()
        if not name:
            raise FeeValidationError("Expense category is required.")
        return ExpenseHead.objects.create(
            exp_category=name,
            description=str(payload.get("description", "")).strip() or None,
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            is_deleted="no",
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> ExpenseHead:
        row = self.get(pk)
        if "exp_category" in payload:
            name = str(payload["exp_category"]).strip()
            if not name:
                raise FeeValidationError("Expense category cannot be empty.")
            row.exp_category = name
        if "description" in payload:
            row.description = str(payload["description"]).strip() or None
        if "is_active" in payload:
            row.is_active = str(payload["is_active"]).strip() or "yes"
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        row.is_deleted = "yes"
        row.updated_at = timezone.now().date()
        row.save(update_fields=["is_deleted", "updated_at"])


class IncomeService:
    def list(self, *, query: str | None = None):
        qs = _active_filter(Income.objects.all()).order_by("-date", "-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(name__icontains=term)
                | Q(invoice_no__icontains=term)
                | Q(note__icontains=term)
            )
        return qs

    def get(self, pk: int) -> Income:
        row = _active_filter(Income.objects.filter(id=pk)).first()
        if row is None:
            raise FeeNotFoundError("Income record not found.")
        return row

    def create(self, payload: dict[str, Any]) -> Income:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise FeeValidationError("Income name is required.")
        amount = float(payload.get("amount") or 0)
        if amount < 0:
            raise FeeValidationError("Amount cannot be negative.")
        head_id = payload.get("income_head_id")
        if head_id is not None:
            IncomeHeadService().get(int(head_id))
        return Income.objects.create(
            income_head_id=head_id,
            name=name,
            invoice_no=str(payload.get("invoice_no", "")).strip() or None,
            date=payload.get("date") or timezone.now().date(),
            amount=amount,
            note=str(payload.get("note", "")).strip() or None,
            documents=str(payload.get("documents", "")).strip() or None,
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            is_deleted="no",
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> Income:
        row = self.get(pk)
        if "name" in payload:
            name = str(payload["name"]).strip()
            if not name:
                raise FeeValidationError("Income name cannot be empty.")
            row.name = name
        if "income_head_id" in payload:
            head_id = payload["income_head_id"]
            if head_id is not None:
                IncomeHeadService().get(int(head_id))
            row.income_head_id = head_id
        if "invoice_no" in payload:
            row.invoice_no = str(payload["invoice_no"] or "").strip() or None
        if "date" in payload:
            row.date = payload["date"]
        if "amount" in payload:
            amount = float(payload["amount"] or 0)
            if amount < 0:
                raise FeeValidationError("Amount cannot be negative.")
            row.amount = amount
        if "note" in payload:
            row.note = str(payload["note"] or "").strip() or None
        if "documents" in payload:
            row.documents = str(payload["documents"] or "").strip() or None
        if "is_active" in payload:
            row.is_active = str(payload["is_active"]).strip() or "yes"
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        row.is_deleted = "yes"
        row.updated_at = timezone.now().date()
        row.save(update_fields=["is_deleted", "updated_at"])


class ExpenseService:
    def list(self, *, query: str | None = None):
        qs = _active_filter(Expenses.objects.all()).order_by("-date", "-id")
        term = (query or "").strip()
        if term:
            qs = qs.filter(
                Q(name__icontains=term)
                | Q(invoice_no__icontains=term)
                | Q(note__icontains=term)
            )
        return qs

    def get(self, pk: int) -> Expenses:
        row = _active_filter(Expenses.objects.filter(id=pk)).first()
        if row is None:
            raise FeeNotFoundError("Expense record not found.")
        return row

    def create(self, payload: dict[str, Any]) -> Expenses:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise FeeValidationError("Expense name is required.")
        amount = float(payload.get("amount") or 0)
        if amount < 0:
            raise FeeValidationError("Amount cannot be negative.")
        head_id = payload.get("exp_head_id")
        if head_id is not None:
            ExpenseHeadService().get(int(head_id))
        return Expenses.objects.create(
            exp_head_id=head_id,
            name=name,
            invoice_no=str(payload.get("invoice_no", "")).strip() or None,
            date=payload.get("date") or timezone.now().date(),
            amount=amount,
            note=str(payload.get("note", "")).strip() or None,
            documents=str(payload.get("documents", "")).strip() or None,
            is_active=str(payload.get("is_active") or "yes").strip() or "yes",
            is_deleted="no",
            created_at=timezone.now(),
            updated_at=timezone.now().date(),
        )

    def update(self, pk: int, payload: dict[str, Any]) -> Expenses:
        row = self.get(pk)
        if "name" in payload:
            name = str(payload["name"]).strip()
            if not name:
                raise FeeValidationError("Expense name cannot be empty.")
            row.name = name
        if "exp_head_id" in payload:
            head_id = payload["exp_head_id"]
            if head_id is not None:
                ExpenseHeadService().get(int(head_id))
            row.exp_head_id = head_id
        if "invoice_no" in payload:
            row.invoice_no = str(payload["invoice_no"] or "").strip() or None
        if "date" in payload:
            row.date = payload["date"]
        if "amount" in payload:
            amount = float(payload["amount"] or 0)
            if amount < 0:
                raise FeeValidationError("Amount cannot be negative.")
            row.amount = amount
        if "note" in payload:
            row.note = str(payload["note"] or "").strip() or None
        if "documents" in payload:
            row.documents = str(payload["documents"] or "").strip() or None
        if "is_active" in payload:
            row.is_active = str(payload["is_active"]).strip() or "yes"
        row.updated_at = timezone.now().date()
        row.save()
        return row

    def delete(self, pk: int) -> None:
        row = self.get(pk)
        row.is_deleted = "yes"
        row.updated_at = timezone.now().date()
        row.save(update_fields=["is_deleted", "updated_at"])
