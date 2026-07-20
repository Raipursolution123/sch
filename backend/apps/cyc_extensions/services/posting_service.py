import logging
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.cyc_extensions.models.cyc_entries import CycEntries
from apps.cyc_extensions.models.cyc_entryitems import CycEntryitems
from apps.cyc_extensions.models.cyc_fee_head_ledger import CycFeeHeadLedger
from apps.cyc_extensions.models.cyc_ledgers import CycLedgers

logger = logging.getLogger(__name__)


class AccountPostingError(Exception):
    pass


class PostingService:
    @transaction.atomic
    def create_journal_entry(self, data: dict) -> CycEntries:
        """
        Creates a new CycEntries record and its associated CycEntryitems.
        Ensures that Debits == Credits.
        """
        items = data.get("items", [])
        if not items:
            raise AccountPostingError(
                "A journal entry must contain at least two items."
            )

        dr_total = Decimal("0.00")
        cr_total = Decimal("0.00")

        for item in items:
            amt = Decimal(str(item.get("amount", 0)))
            dc = item.get("dc", "").lower()
            if dc == "dr":
                dr_total += amt
            elif dc == "cr":
                cr_total += amt
            else:
                raise AccountPostingError(
                    "Entry item must specify 'dc' as 'dr' or 'cr'."
                )

        if dr_total != cr_total:
            raise AccountPostingError(
                f"Debits and Credits must balance. Dr: {dr_total}, Cr: {cr_total}"
            )

        entry = CycEntries.objects.create(
            tag_id=data.get("tag_id"),
            entrytype_id=data.get("entrytype_id"),
            number=data.get("number"),
            date=data.get("date", timezone.now().date()),
            dr_total=dr_total,
            cr_total=cr_total,
            notes=data.get("notes", ""),
            transaction_id=data.get("transaction_id", ""),
        )

        for item in items:
            CycEntryitems.objects.create(
                entry_id=entry.id,
                ledger_id=item["ledger_id"],
                amount=Decimal(str(item["amount"])),
                dc=item["dc"].lower(),
                narration=item.get("narration", ""),
            )

        return entry

    @transaction.atomic
    def post_fee_payment_entry(self, fee_payment_id: int):
        """
        Auto-posts a fee payment to the accounting ledger.
        In a real scenario, this would fetch the fee payment, calculate the totals
        split by fee head, resolve them via CycFeeHeadLedger to income ledgers,
        and debit the cash/bank ledger.
        """
        # Note: Implementation depends on the fee payment model structure.
        # This is a placeholder for the actual integration.
        logger.info(f"Auto-posting fee payment {fee_payment_id} to accounting ledgers.")
        pass

    def get_trial_balance(self):
        """
        Generates a basic trial balance summary.
        """
        ledgers = CycLedgers.objects.all()
        result = []
        for ledger in ledgers:
            # Aggregate all dr/cr from CycEntryitems for this ledger
            items = CycEntryitems.objects.filter(ledger_id=ledger.id)
            dr_sum = sum(item.amount for item in items if item.dc == "dr")
            cr_sum = sum(item.amount for item in items if item.dc == "cr")

            # Simplified running balance
            op_bal = Decimal(str(ledger.op_balance))
            if ledger.op_balance_dc == "dr":
                dr_sum += op_bal
            else:
                cr_sum += op_bal

            result.append(
                {
                    "ledger_id": ledger.id,
                    "ledger_name": ledger.name,
                    "total_dr": dr_sum,
                    "total_cr": cr_sum,
                }
            )
        return result
