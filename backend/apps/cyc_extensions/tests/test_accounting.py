from decimal import Decimal
from unittest import skip

from django.test import TestCase
from django.utils import timezone

from apps.cyc_extensions.models.cyc_entryitems import CycEntryitems
from apps.cyc_extensions.services.posting_service import (
    AccountPostingError,
    PostingService,
)


class AccountingPostingServiceTest(TestCase):
    def setUp(self):
        self.service = PostingService()

    @skip("unmanaged cyc_entries table is not provisioned in CI test schema")
    def test_journal_entry_balanced(self):
        """Integration test — requires legacy cyc_* tables in the database."""
        data = {
            "entrytype_id": 1,
            "date": timezone.now().date(),
            "notes": "Test Balanced Entry",
            "items": [
                {"ledger_id": 100, "amount": 500.00, "dc": "dr"},
                {"ledger_id": 200, "amount": 500.00, "dc": "cr"},
            ],
        }
        entry = self.service.create_journal_entry(data)

        self.assertIsNotNone(entry.id)
        self.assertEqual(entry.dr_total, Decimal("500.00"))
        self.assertEqual(entry.cr_total, Decimal("500.00"))

        items = CycEntryitems.objects.filter(entry_id=entry.id)
        self.assertEqual(items.count(), 2)

    def test_journal_entry_unbalanced(self):
        """Unbalanced journal entries raise AccountPostingError before DB writes."""
        data = {
            "entrytype_id": 1,
            "date": timezone.now().date(),
            "notes": "Test Unbalanced Entry",
            "items": [
                {"ledger_id": 100, "amount": 600.00, "dc": "dr"},
                {"ledger_id": 200, "amount": 500.00, "dc": "cr"},
            ],
        }
        with self.assertRaises(AccountPostingError) as context:
            self.service.create_journal_entry(data)

        self.assertIn("Debits and Credits must balance", str(context.exception))

    def test_journal_entry_no_items(self):
        """Entries with no line items are rejected."""
        data = {"entrytype_id": 1, "date": timezone.now().date(), "items": []}
        with self.assertRaises(AccountPostingError) as context:
            self.service.create_journal_entry(data)

        self.assertIn("must contain at least two items", str(context.exception))
