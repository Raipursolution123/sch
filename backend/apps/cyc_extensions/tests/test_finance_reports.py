from __future__ import annotations

from unittest.mock import patch

import pytest

from apps.alumni.services.alumni_service import (
    AlumniEventService,
    AlumniStudentService,
    AlumniValidationError,
)
from apps.cyc_extensions.services.finance_report_service import FinanceReportService
from apps.cyc_extensions.services.posting_service import AccountPostingError


def test_trial_balance_rejects_inverted_dates():
    with pytest.raises(AccountPostingError, match="from_date"):
        FinanceReportService().get_trial_balance(
            from_date="2026-12-31", to_date="2026-01-01"
        )


def test_profit_loss_rejects_inverted_dates():
    with pytest.raises(AccountPostingError, match="from_date"):
        FinanceReportService().get_profit_loss(
            from_date="2026-12-31", to_date="2026-01-01"
        )


def test_ledger_statement_requires_ledger():
    with patch(
        "apps.cyc_extensions.services.finance_report_service.CycLedgers.objects"
    ) as ledgers:
        ledgers.filter.return_value.first.return_value = None
        with pytest.raises(AccountPostingError, match="Ledger not found"):
            FinanceReportService().get_ledger_statement(ledger_id=999)


def test_alumni_requires_student():
    with pytest.raises(AlumniValidationError, match="student_id"):
        AlumniStudentService().create({"current_email": "a@b.com"})


def test_alumni_event_requires_title():
    with pytest.raises(AlumniValidationError, match="title"):
        AlumniEventService().create(
            {
                "title": " ",
                "from_date": "2026-01-01T10:00:00",
                "to_date": "2026-01-02T10:00:00",
            }
        )


def test_alumni_event_requires_dates():
    with pytest.raises(AlumniValidationError, match="from_date"):
        AlumniEventService().create({"title": "Reunion"})
