from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from django.db.models import Q, Sum
from django.utils.dateparse import parse_date

from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.models.cyc_entryitems import CycEntryitems
from apps.cyc_extensions.models.cyc_groups import CycGroups
from apps.cyc_extensions.models.cyc_ledgers import CycLedgers
from apps.cyc_extensions.services.posting_service import AccountPostingError


def _dec(value: Any) -> Decimal:
    try:
        return Decimal(str(value or 0))
    except Exception:
        return Decimal("0")


def _parse_date(value: Any) -> date | None:
    if value in (None, ""):
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    parsed = parse_date(str(value)[:10])
    if parsed is None:
        raise AccountPostingError(f"Invalid date: {value}")
    return parsed


def _norm_dc(value: Any) -> str:
    raw = str(value or "").strip().lower()
    if raw in ("dr", "d", "debit"):
        return "dr"
    if raw in ("cr", "c", "credit"):
        return "cr"
    return raw


class FinanceReportService:
    """Read-only financial reports over cyc_* ledgers and entry items."""

    def _group_map(self) -> dict[int, CycGroups]:
        return {g.id: g for g in CycGroups.objects.all()}

    def _root_group(
        self, group_id: int, groups: dict[int, CycGroups]
    ) -> CycGroups | None:
        seen: set[int] = set()
        current = groups.get(group_id)
        while current and current.parent_id and current.parent_id not in seen:
            seen.add(current.id)
            parent = groups.get(current.parent_id)
            if parent is None:
                break
            current = parent
        return current

    def _classify_root(self, root: CycGroups | None) -> str:
        if root is None:
            return "other"
        name = (root.name or "").strip().lower()
        code = (root.code or "").strip().lower()
        blob = f"{name} {code}"
        if any(k in blob for k in ("asset", "assets")):
            return "asset"
        if any(k in blob for k in ("liabilit", "liabilities", "equity", "capital")):
            return "liability"
        if any(k in blob for k in ("income", "revenue", "receipt")):
            return "income"
        if any(k in blob for k in ("expense", "expenses", "expenditure", "cost")):
            return "expense"
        return "other"

    def _ledger_activity(
        self,
        *,
        from_date: date | None = None,
        to_date: date | None = None,
    ) -> dict[int, dict[str, Decimal]]:
        entry_qs = CycEntries.objects.all()
        if from_date:
            entry_qs = entry_qs.filter(date__gte=from_date)
        if to_date:
            entry_qs = entry_qs.filter(date__lte=to_date)
        entry_ids = list(entry_qs.values_list("id", flat=True))

        activity: dict[int, dict[str, Decimal]] = defaultdict(
            lambda: {"dr": Decimal("0"), "cr": Decimal("0")}
        )
        if not entry_ids:
            return activity

        # Chunk to avoid oversized IN clauses on large journals.
        chunk = 500
        for i in range(0, len(entry_ids), chunk):
            ids = entry_ids[i : i + chunk]
            rows = (
                CycEntryitems.objects.filter(entry_id__in=ids)
                .values("ledger_id", "dc")
                .annotate(total=Sum("amount"))
            )
            for row in rows:
                lid = int(row["ledger_id"])
                dc = _norm_dc(row["dc"])
                if dc in ("dr", "cr"):
                    activity[lid][dc] += _dec(row["total"])
        return activity

    def _ledger_rows(
        self,
        *,
        from_date: date | None = None,
        to_date: date | None = None,
        include_opening: bool = True,
    ) -> list[dict[str, Any]]:
        activity = self._ledger_activity(from_date=from_date, to_date=to_date)
        groups = self._group_map()
        result: list[dict[str, Any]] = []
        for ledger in CycLedgers.objects.all().order_by("name", "id"):
            dr = activity[ledger.id]["dr"]
            cr = activity[ledger.id]["cr"]
            op_dr = Decimal("0")
            op_cr = Decimal("0")
            if include_opening:
                op = _dec(ledger.op_balance)
                if _norm_dc(ledger.op_balance_dc) == "dr":
                    op_dr = op
                else:
                    op_cr = op
            total_dr = op_dr + dr
            total_cr = op_cr + cr
            net = total_dr - total_cr
            closing_dr = net if net > 0 else Decimal("0")
            closing_cr = -net if net < 0 else Decimal("0")
            group = groups.get(int(ledger.group_id)) if ledger.group_id else None
            root = (
                self._root_group(int(ledger.group_id), groups)
                if ledger.group_id
                else None
            )
            result.append(
                {
                    "ledger_id": ledger.id,
                    "ledger_name": ledger.name,
                    "ledger_code": ledger.code,
                    "group_id": ledger.group_id,
                    "group_name": group.name if group else None,
                    "root_group_id": root.id if root else None,
                    "root_group_name": root.name if root else None,
                    "classification": self._classify_root(root),
                    "affects_gross": int(group.affects_gross) if group else 0,
                    "opening_dr": op_dr,
                    "opening_cr": op_cr,
                    "period_dr": dr,
                    "period_cr": cr,
                    "total_dr": total_dr,
                    "total_cr": total_cr,
                    "closing_dr": closing_dr,
                    "closing_cr": closing_cr,
                    "reconciliation": int(ledger.reconciliation or 0),
                }
            )
        return result

    def get_trial_balance(
        self, *, from_date: str | None = None, to_date: str | None = None
    ) -> dict[str, Any]:
        start = _parse_date(from_date)
        end = _parse_date(to_date)
        if start and end and start > end:
            raise AccountPostingError("from_date cannot be after to_date.")
        rows = self._ledger_rows(from_date=start, to_date=end, include_opening=True)
        total_dr = sum((r["total_dr"] for r in rows), Decimal("0"))
        total_cr = sum((r["total_cr"] for r in rows), Decimal("0"))
        return {
            "from_date": start.isoformat() if start else None,
            "to_date": end.isoformat() if end else None,
            "rows": [
                {
                    "ledger_id": r["ledger_id"],
                    "ledger_name": r["ledger_name"],
                    "group_name": r["group_name"],
                    "total_dr": r["total_dr"],
                    "total_cr": r["total_cr"],
                    "closing_dr": r["closing_dr"],
                    "closing_cr": r["closing_cr"],
                }
                for r in rows
                if r["total_dr"] or r["total_cr"]
            ],
            "totals": {"total_dr": total_dr, "total_cr": total_cr},
        }

    def get_balance_sheet(self, *, as_of: str | None = None) -> dict[str, Any]:
        end = _parse_date(as_of)
        rows = self._ledger_rows(to_date=end, include_opening=True)
        assets = [r for r in rows if r["classification"] == "asset"]
        liabilities = [r for r in rows if r["classification"] == "liability"]

        def side_total(items: list[dict[str, Any]], prefer_dr: bool) -> Decimal:
            total = Decimal("0")
            for r in items:
                net = r["total_dr"] - r["total_cr"]
                total += net if prefer_dr else -net
            return total

        asset_total = side_total(assets, prefer_dr=True)
        liability_total = side_total(liabilities, prefer_dr=False)
        return {
            "as_of": end.isoformat() if end else None,
            "assets": [
                {
                    "ledger_id": r["ledger_id"],
                    "ledger_name": r["ledger_name"],
                    "group_name": r["group_name"],
                    "amount": r["total_dr"] - r["total_cr"],
                }
                for r in assets
                if r["total_dr"] or r["total_cr"]
            ],
            "liabilities": [
                {
                    "ledger_id": r["ledger_id"],
                    "ledger_name": r["ledger_name"],
                    "group_name": r["group_name"],
                    "amount": r["total_cr"] - r["total_dr"],
                }
                for r in liabilities
                if r["total_dr"] or r["total_cr"]
            ],
            "totals": {
                "assets": asset_total,
                "liabilities": liability_total,
                "difference": asset_total - liability_total,
            },
        }

    def get_profit_loss(
        self, *, from_date: str | None = None, to_date: str | None = None
    ) -> dict[str, Any]:
        start = _parse_date(from_date)
        end = _parse_date(to_date)
        if start and end and start > end:
            raise AccountPostingError("from_date cannot be after to_date.")
        # P&L is period activity (no opening balance).
        rows = self._ledger_rows(from_date=start, to_date=end, include_opening=False)
        income = [r for r in rows if r["classification"] == "income"]
        expenses = [r for r in rows if r["classification"] == "expense"]

        def amount_income(r: dict[str, Any]) -> Decimal:
            return r["period_cr"] - r["period_dr"]

        def amount_expense(r: dict[str, Any]) -> Decimal:
            return r["period_dr"] - r["period_cr"]

        gross_income = sum(
            (amount_income(r) for r in income if r["affects_gross"]), Decimal("0")
        )
        gross_expense = sum(
            (amount_expense(r) for r in expenses if r["affects_gross"]), Decimal("0")
        )
        net_income = sum((amount_income(r) for r in income), Decimal("0"))
        net_expense = sum((amount_expense(r) for r in expenses), Decimal("0"))
        return {
            "from_date": start.isoformat() if start else None,
            "to_date": end.isoformat() if end else None,
            "income": [
                {
                    "ledger_id": r["ledger_id"],
                    "ledger_name": r["ledger_name"],
                    "group_name": r["group_name"],
                    "affects_gross": r["affects_gross"],
                    "amount": amount_income(r),
                }
                for r in income
                if r["period_dr"] or r["period_cr"]
            ],
            "expenses": [
                {
                    "ledger_id": r["ledger_id"],
                    "ledger_name": r["ledger_name"],
                    "group_name": r["group_name"],
                    "affects_gross": r["affects_gross"],
                    "amount": amount_expense(r),
                }
                for r in expenses
                if r["period_dr"] or r["period_cr"]
            ],
            "totals": {
                "gross_profit": gross_income - gross_expense,
                "net_profit": net_income - net_expense,
                "total_income": net_income,
                "total_expenses": net_expense,
            },
        }

    def get_ledger_statement(
        self,
        *,
        ledger_id: int,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> dict[str, Any]:
        ledger = CycLedgers.objects.filter(id=ledger_id).first()
        if ledger is None:
            raise AccountPostingError("Ledger not found.")
        start = _parse_date(from_date)
        end = _parse_date(to_date)
        if start and end and start > end:
            raise AccountPostingError("from_date cannot be after to_date.")

        opening_dr = Decimal("0")
        opening_cr = Decimal("0")
        op = _dec(ledger.op_balance)
        if _norm_dc(ledger.op_balance_dc) == "dr":
            opening_dr = op
        else:
            opening_cr = op

        # Opening = ledger OP + activity before from_date
        if start:
            prior = self._ledger_activity(
                to_date=date.fromordinal(start.toordinal() - 1)
            )
            opening_dr += prior[ledger.id]["dr"]
            opening_cr += prior[ledger.id]["cr"]

        entry_qs = CycEntries.objects.all().order_by("date", "id")
        if start:
            entry_qs = entry_qs.filter(date__gte=start)
        if end:
            entry_qs = entry_qs.filter(date__lte=end)
        entries = {e.id: e for e in entry_qs}
        items = list(
            CycEntryitems.objects.filter(
                ledger_id=ledger.id, entry_id__in=list(entries.keys())
            ).order_by("id")
        )
        items.sort(key=lambda it: (entries[it.entry_id].date, it.entry_id, it.id))

        running = opening_dr - opening_cr
        lines: list[dict[str, Any]] = []
        for item in items:
            entry = entries[item.entry_id]
            amt = _dec(item.amount)
            dc = _norm_dc(item.dc)
            if dc == "dr":
                running += amt
            else:
                running -= amt
            lines.append(
                {
                    "entry_id": entry.id,
                    "date": entry.date.isoformat() if entry.date else None,
                    "entry_number": entry.number,
                    "narration": item.narration or entry.notes or "",
                    "dc": dc,
                    "amount": amt,
                    "running_balance": running,
                    "reconciliation_date": (
                        item.reconciliation_date.isoformat()
                        if item.reconciliation_date
                        else None
                    ),
                    "item_id": item.id,
                }
            )
        return {
            "ledger_id": ledger.id,
            "ledger_name": ledger.name,
            "from_date": start.isoformat() if start else None,
            "to_date": end.isoformat() if end else None,
            "opening_balance": opening_dr - opening_cr,
            "closing_balance": running,
            "lines": lines,
        }

    def get_ledger_entries(
        self,
        *,
        ledger_id: int | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
    ) -> dict[str, Any]:
        start = _parse_date(from_date)
        end = _parse_date(to_date)
        entry_qs = CycEntries.objects.all().order_by("-date", "-id")
        if start:
            entry_qs = entry_qs.filter(date__gte=start)
        if end:
            entry_qs = entry_qs.filter(date__lte=end)
        entries = list(entry_qs[:500])
        entry_ids = [e.id for e in entries]
        items_qs = CycEntryitems.objects.filter(entry_id__in=entry_ids)
        if ledger_id:
            items_qs = items_qs.filter(ledger_id=ledger_id)
        items_by_entry: dict[int, list] = defaultdict(list)
        ledger_ids = set()
        for item in items_qs:
            items_by_entry[item.entry_id].append(item)
            ledger_ids.add(item.ledger_id)
        ledger_names = {
            l.id: l.name for l in CycLedgers.objects.filter(id__in=ledger_ids)
        }
        rows = []
        for entry in entries:
            for item in items_by_entry.get(entry.id, []):
                rows.append(
                    {
                        "entry_id": entry.id,
                        "date": entry.date.isoformat() if entry.date else None,
                        "entry_number": entry.number,
                        "ledger_id": item.ledger_id,
                        "ledger_name": ledger_names.get(
                            item.ledger_id, str(item.ledger_id)
                        ),
                        "dc": _norm_dc(item.dc),
                        "amount": _dec(item.amount),
                        "narration": item.narration or entry.notes or "",
                    }
                )
        return {
            "from_date": start.isoformat() if start else None,
            "to_date": end.isoformat() if end else None,
            "ledger_id": ledger_id,
            "rows": rows,
        }

    def get_reconciliation(self, *, ledger_id: int | None = None) -> dict[str, Any]:
        ledgers = CycLedgers.objects.filter(reconciliation=1).order_by("name")
        if ledger_id:
            ledgers = ledgers.filter(id=ledger_id)
        ledger_list = list(ledgers)
        if not ledger_list:
            return {"ledgers": [], "items": []}
        ids = [l.id for l in ledger_list]
        items = list(
            CycEntryitems.objects.filter(ledger_id__in=ids).order_by("-id")[:1000]
        )
        entry_ids = {i.entry_id for i in items}
        entries = {e.id: e for e in CycEntries.objects.filter(id__in=entry_ids)}
        names = {l.id: l.name for l in ledger_list}
        return {
            "ledgers": [{"id": l.id, "name": l.name} for l in ledger_list],
            "items": [
                {
                    "item_id": item.id,
                    "ledger_id": item.ledger_id,
                    "ledger_name": names.get(item.ledger_id),
                    "entry_id": item.entry_id,
                    "date": (
                        entries[item.entry_id].date.isoformat()
                        if item.entry_id in entries and entries[item.entry_id].date
                        else None
                    ),
                    "amount": _dec(item.amount),
                    "dc": _norm_dc(item.dc),
                    "narration": item.narration,
                    "reconciliation_date": (
                        item.reconciliation_date.isoformat()
                        if item.reconciliation_date
                        else None
                    ),
                    "is_reconciled": item.reconciliation_date is not None,
                }
                for item in items
            ],
        }

    def set_reconciliation(
        self, *, item_id: int, reconciliation_date: str | None
    ) -> dict[str, Any]:
        item = CycEntryitems.objects.filter(id=item_id).first()
        if item is None:
            raise AccountPostingError("Entry item not found.")
        ledger = CycLedgers.objects.filter(id=item.ledger_id).first()
        if ledger is None or not ledger.reconciliation:
            raise AccountPostingError("Ledger is not enabled for reconciliation.")
        parsed = _parse_date(reconciliation_date) if reconciliation_date else None
        item.reconciliation_date = parsed
        item.save(update_fields=["reconciliation_date"])
        return {
            "item_id": item.id,
            "reconciliation_date": parsed.isoformat() if parsed else None,
            "is_reconciled": parsed is not None,
        }
