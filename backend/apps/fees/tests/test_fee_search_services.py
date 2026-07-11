from unittest.mock import patch

import pytest

from apps.fees.domain.fee_exceptions import FeeValidationError
from apps.fees.services.fee_due_search_service import FeeDueSearchService
from apps.fees.services.fee_payment_search_service import FeePaymentSearchService
from datetime import date


def test_due_search_requires_active_session():
    with patch(
        "apps.fees.services.fee_due_search_service.selectors.get_active_session",
        return_value=None,
    ):
        with pytest.raises(FeeValidationError, match="active academic session"):
            FeeDueSearchService().search_due_fees()


def test_payment_search_requires_active_session():
    with patch(
        "apps.fees.services.fee_payment_search_service.selectors.get_active_session",
        return_value=None,
    ):
        with pytest.raises(FeeValidationError, match="active academic session"):
            FeePaymentSearchService().search_payments(
                from_date=date(2025, 1, 1),
                to_date=date(2025, 1, 31),
            )


def test_payment_search_rejects_invalid_date_range():
    session = patch(
        "apps.fees.services.fee_payment_search_service.selectors.get_active_session"
    )
    with session as mock_session:
        mock_session.return_value = type("S", (), {"session": "2025-26"})()
        with pytest.raises(FeeValidationError, match="from_date cannot be after"):
            FeePaymentSearchService().search_payments(
                from_date=date(2025, 2, 1),
                to_date=date(2025, 1, 1),
            )
